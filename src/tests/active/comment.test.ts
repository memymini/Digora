import { describe, it, expect, vi, beforeEach } from "vitest";
import { commentService } from "@/services/commentService";
import { commentRepository } from "@/repositories/commentRepository";
import { SupabaseClient } from "@supabase/supabase-js";

// Mock commentRepository
vi.mock("@/repositories/commentRepository", () => ({
  commentRepository: {
    getComments: vi.fn(),
    getUserBallot: vi.fn(),
    createComment: vi.fn(),
    createReport: vi.fn(),
  },
}));

// Mock utils
vi.mock("@/utils/mappers", () => ({
  commentsMapper: (data: any) => ({ comments: data, totalCount: data.length }),
  singleCommentMapper: (data: any) => data,
}));

describe("commentService", () => {
  let mockClient: SupabaseClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = {} as SupabaseClient;
  });

  describe("getComments", () => {
    it("should allow viewing comments without userId (not logged in)", async () => {
      const mockComments = [{ id: 1, content: "hello" }];
      vi.mocked(commentRepository.getComments).mockResolvedValue({
        data: mockComments as any,
        error: null,
      });
      // getUserBallot returns null/error cleanly or we mocked promise resolve
      // The service does: userId ? getUserBallot : Promise.resolve

      const result = await commentService.getComments(mockClient, 1, undefined);

      expect(result.comments).toEqual(mockComments);
      expect(result.isUserVoted).toBe(false);
      expect(commentRepository.getUserBallot).not.toHaveBeenCalled();
    });

    it("should check user ballot if userId provided", async () => {
      const mockComments = [{ id: 1, content: "hi" }];
      vi.mocked(commentRepository.getComments).mockResolvedValue({
        data: mockComments as any,
        error: null,
      });
      vi.mocked(commentRepository.getUserBallot).mockResolvedValue({
        data: { option_id: 10 } as any,
        error: null,
      });

      const result = await commentService.getComments(
        mockClient,
        1,
        "user-123"
      );

      expect(result.isUserVoted).toBe(true);
      expect(commentRepository.getUserBallot).toHaveBeenCalled();
    });
  });

  describe("createComment", () => {
    it("should create comment (requires userId assumption)", async () => {
      const mockComment = { id: 123, content: "New Comment" };
      vi.mocked(commentRepository.createComment).mockResolvedValue({
        data: mockComment as any,
        error: null,
      });

      const result = await commentService.createComment(
        mockClient,
        1,
        "user-123",
        "content"
      );

      expect(result).toEqual(mockComment);
      expect(commentRepository.createComment).toHaveBeenCalledWith(
        mockClient,
        1,
        "user-123",
        "content",
        undefined
      );
    });

    // Note: The service itself doesn't check "is logged in", it assumes caller provides valid userId.
    // Testing that it passes userId to repo confirms it relies on it.
  });

  describe("reportComment", () => {
    it("should report comment successfully", async () => {
      vi.mocked(commentRepository.createReport).mockResolvedValue({
        error: null,
      });

      const result = await commentService.reportComment(
        mockClient,
        100,
        "user-123",
        "spam"
      );
      expect(result.message).toContain("신고가 접수되었습니다");
    });
  });
});
