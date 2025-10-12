import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-primary">404 Not Found</h1>
        <p className="mb-4 text-xl text-gray-600">페이지를 찾을 수 없습니다.</p>
        <Link href="/" className="text-gray-600 underline hover:text-gray-700">
          돌아가기
        </Link>
      </div>
    </div>
  );
}
