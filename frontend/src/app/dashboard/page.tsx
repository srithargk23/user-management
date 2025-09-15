// "use client";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { getToken, clearToken } from "../../lib/auth";

// export default function DashboardPage() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = getToken();
//     if (!token) {
//       router.push("/login");
//     } else {
//       setLoading(false);
//     }
//   }, [router]);

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold">Welcome Admin </h1>
//       <button
//         onClick={() => {
//           clearToken();
//           router.push("/login");
//         }}
//         className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md"
//       >
//         Logout
//       </button>
//     </div>
//   );
// }
