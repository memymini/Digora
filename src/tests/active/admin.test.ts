/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { adminVoteService } from "@/services/adminVoteService";
import { adminVoteRepository } from "@/repositories/adminVoteRepository";
import { SupabaseClient } from "@supabase/supabase-js";

// Mock repository
vi.mock("@/repositories/adminVoteRepository", () => ({
  adminVoteRepository: {
    getProfile: vi.fn(),
    insertVote: vi.fn(),
    insertVoteOptions: vi.fn(),
    uploadImage: vi.fn(),
  },
}));

describe("adminVoteService", () => {
  let mockClient: SupabaseClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = {} as SupabaseClient;
  });

  describe("createVote", () => {
    it("should allow creating vote if user is admin", async () => {
      // Mock profile check -> admin
      vi.mocked(adminVoteRepository.getProfile).mockResolvedValue({
        data: { role: "admin" } as any,
        error: null,
      });

      // Mock insertions
      vi.mocked(adminVoteRepository.insertVote).mockResolvedValue({
        data: { id: 100 } as any,
        error: null,
      });
      vi.mocked(adminVoteRepository.insertVoteOptions).mockResolvedValue({
        error: null,
      });
      vi.spyOn(adminVoteService, "uploadImage").mockResolvedValue("http://url");

      const formData = new FormData();
      formData.append("title", "Test Vote");
      formData.append("options[0][name]", "Option 1");
      formData.append("options[0][file]", new File([], "test.png"));

      const result = await adminVoteService.createVote(
        mockClient,
        "admin-id",
        formData
      );

      expect(result).toHaveProperty("id", 100);
    });

    it("should throw error if user is NOT admin", async () => {
      // Mock profile check -> user
      vi.mocked(adminVoteRepository.getProfile).mockResolvedValue({
        data: { role: "user" } as any,
        error: null,
      });

      const formData = new FormData();
      await expect(
        adminVoteService.createVote(mockClient, "user-id", formData)
      ).rejects.toThrow("User is not admin.");
    });
  });
});
