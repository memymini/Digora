/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { voteService } from "@/services/voteService";
import { voteRepository } from "@/repositories/voteRepository";
import { SupabaseClient } from "@supabase/supabase-js";

// Mock voteRepository
vi.mock("@/repositories/voteRepository", () => ({
  voteRepository: {
    getVoteById: vi.fn(),
    castBallot: vi.fn(),
    getDailyVoteCount: vi.fn(),
  },
}));

describe("voteService", () => {
  let mockClient: SupabaseClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = {} as SupabaseClient;
  });

  describe("handleVote", () => {
    const mockVoteId = 1;
    const mockUserId = "user-123";
    const mockOptionId = 10;
    const mockVote = { id: mockVoteId, status: "ongoing" };

    it("should allow voting successfully when conditions are met", async () => {
      // Mock getVoteById -> Return ongoing vote
      vi.mocked(voteRepository.getVoteById).mockResolvedValue({
        data: mockVote as any,
        error: null,
      });

      // Mock getDailyVoteCount -> Return 0 (under limit)
      vi.mocked(voteRepository.getDailyVoteCount).mockResolvedValue({
        count: 0,
        error: null,
      });

      // Mock castBallot -> Success
      vi.mocked(voteRepository.castBallot).mockResolvedValue({
        error: null,
      });

      const result = await voteService.handleVote(
        mockClient,
        mockUserId,
        mockVoteId,
        mockOptionId
      );

      expect(result).toEqual({ success: true });
      expect(voteRepository.getDailyVoteCount).toHaveBeenCalledWith(
        mockClient,
        mockUserId
      );
    });

    it("should throw DAILY_LIMIT_EXCEEDED when daily count is 100", async () => {
      vi.mocked(voteRepository.getVoteById).mockResolvedValue({
        data: mockVote as any,
        error: null,
      });

      // Mock daily count 100
      vi.mocked(voteRepository.getDailyVoteCount).mockResolvedValue({
        count: 100,
        error: null,
      });

      await expect(
        voteService.handleVote(mockClient, mockUserId, mockVoteId, mockOptionId)
      ).rejects.toThrow("DAILY_LIMIT_EXCEEDED");
    });

    it("should allow duplicate voting (no ALREADY_VOTED error)", async () => {
      vi.mocked(voteRepository.getVoteById).mockResolvedValue({
        data: mockVote as any,
        error: null,
      });

      vi.mocked(voteRepository.getDailyVoteCount).mockResolvedValue({
        count: 5,
        error: null,
      });

      // Simulate castBallot returning a Unique Violation (if DB still has constraint)
      // The Service ignores 23505 if we removed the check, OR we assume castBallot succeeds.
      // If we *removed* the check in service, the service *re-throws* other errors.
      // But if we want to support duplicate votes, the DB setup must support it.
      // Here we assume the DB is updated or castBallot just works (inserting new row).
      // We test that the service *does not* throw "ALREADY_VOTED" even if we were to simulate a scenario
      // where logic might have blocked it.
      // Actually, let's just test success flow again, essentially proving "duplicate" isn't blocked by logic.

      vi.mocked(voteRepository.castBallot).mockResolvedValue({
        error: null,
      });

      await expect(
        voteService.handleVote(mockClient, mockUserId, mockVoteId, mockOptionId)
      ).resolves.toEqual({ success: true });
    });

    it("should throw error if vote is not ongoing", async () => {
      vi.mocked(voteRepository.getVoteById).mockResolvedValue({
        data: { ...mockVote, status: "closed" } as any,
        error: null,
      });

      await expect(
        voteService.handleVote(mockClient, mockUserId, mockVoteId, mockOptionId)
      ).rejects.toThrow("VOTE_NOT_ONGOING");
    });
  });
});
