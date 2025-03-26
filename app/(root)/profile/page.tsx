// import { auth } from "@clerk/nextjs";
// import Image from "next/image";
// import { redirect } from "next/navigation";

// import { Collection } from "@/components/shared/Collection";
// import Header from "@/components/shared/Header";
// import { getUserImages } from "@/lib/actions/image.actions";
// import { getUserById } from "@/lib/actions/user.actions";

// const Profile = async ({ searchParams }: SearchParamProps) => {
//   const page = Number(searchParams?.page) || 1;
//   const { userId } = auth();

//   if (!userId) redirect("/sign-in");

//   const user = await getUserById(userId);
//   const images = await getUserImages({ page, userId: user._id });

//   return (
//     <>
//       <Header title="Profile" />

//       <section className="profile">
//         <div className="profile-balance">
//           <p className="p-14-medium md:p-16-medium">CREDITS AVAILABLE</p>
//           <div className="mt-4 flex items-center gap-4">
//             <Image
//               src="/assets/icons/coins.svg"
//               alt="coins"
//               width={50}
//               height={50}
//               className="size-9 md:size-12"
//             />
//             <h2 className="h2-bold text-dark-600">{user.creditBalance}</h2>
//           </div>
//         </div>

//         <div className="profile-image-manipulation">
//           <p className="p-14-medium md:p-16-medium">IMAGE MANIPULATION DONE</p>
//           <div className="mt-4 flex items-center gap-4">
//             <Image
//               src="/assets/icons/photo.svg"
//               alt="coins"
//               width={50}
//               height={50}
//               className="size-9 md:size-12"
//             />
//             <h2 className="h2-bold text-dark-600">{images?.data.length}</h2>
//           </div>
//         </div>
//       </section>

//       <section className="profile">
//       <div className="profile-image-manipulation">
//           <p className="p-14-medium md:p-16-medium">MY ORDERS</p>
//           <div className="mt-4 flex items-center gap-4">
//             <Image
//               src="/assets/icons/order-icon.svg"
//               alt="coins"
//               width={50}
//               height={50}
//               className="size-9 md:size-12"
//             />
//             <h2 className="h2-bold text-dark-600">{images?.data.length}</h2>
//           </div>
//         </div>

//         <div className="profile-image-manipulation">
//           <p className="p-14-medium md:p-16-medium">BECOME A SELLER</p>
//           <div className="mt-4 flex items-center gap-4">
//             <Image
//               src="/assets/icons/seller.svg"
//               alt="coins"
//               width={50}
//               height={50}
//               className="size-9 md:size-12"
//             />
//             <h2 className="h2-bold text-dark-600">{images?.data.length}</h2>
//           </div>
//         </div>
//       </section>

//       <section className="mt-8 md:mt-14">
//         <Collection
//           images={images?.data}
//           totalPages={images?.totalPages}
//           page={page}
//         />
//       </section>
//     </>
//   );
// };

// export default Profile;

import { auth } from "@clerk/nextjs";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Collection } from "@/components/shared/Collection";
import Header from "@/components/shared/Header";
import { getUserImages } from "@/lib/actions/image.actions";
import { getUserById, getUserRole } from "@/lib/actions/user.actions";
import { getUserOrdersCount } from "@/lib/actions/order.actions"; // Import new function
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Profile = async ({ searchParams }: SearchParamProps) => {
  const page = Number(searchParams?.page) || 1;
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);
  const images = await getUserImages({ page, userId: user._id });
  const orderCount = await getUserOrdersCount(user._id); 
  const userRole = await getUserRole(user._id);


  return (
    <>
      <Header title="Profile" />

      <section className="profile">
        <div className="profile-balance dark:bg-gradient-to-br dark:from-slate-500 dark:to-slate-700">
          <Link href={"/credits"}>
          <p className="p-14-medium md:p-16-medium dark:text-slate-200">CREDITS AVAILABLE</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/coins.svg"
              alt="coins"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="h2-bold text-dark-600 dark:text-slate-200">{user.creditBalance}</h2>
          </div>
          </Link>
        </div>

        <div className="profile-image-manipulation dark:bg-gradient-to-br dark:from-slate-500 dark:to-slate-700">
          <Link href={"/"}>
          <p className="p-14-medium md:p-16-medium dark:text-slate-200">IMAGE MANIPULATION DONE</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/photo.svg"
              alt="coins"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="h2-bold text-dark-600 dark:text-slate-200">{images?.data.length}</h2>
          </div>
          </Link>
        </div>
      </section>

      <section className="profile">
        {/* ✅ MY ORDERS (Updated) */}
        <div className="profile-image-manipulation dark:bg-gradient-to-br dark:from-slate-500 dark:to-slate-700">
          <Link href={"/image-e-com/orders"}>
          <p className="p-14-medium md:p-16-medium dark:text-slate-200">MY ORDERS</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/order-icon.svg"
              alt="orders"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="h2-bold text-dark-600 dark:text-slate-200">{orderCount}</h2>
          </div>
          </Link>
        </div>

        { userRole === "admin" ? (
                  <div className="profile-image-manipulation dark:bg-gradient-to-br dark:from-slate-500 dark:to-slate-700">
                    <Link href={"/image-e-com/admin"}>
                  <p className="p-14-medium md:p-16-medium dark:text-slate-200">MONETIZE YOUR CREATIVITY</p>
                  <div className="mt-4 flex items-center gap-4">
                    <Image
                      src="/assets/icons/upload-image.svg"
                      alt="seller"
                      width={50}
                      height={50}
                      className="size-9 md:size-12"
                    />
                    <h2 className=" text-dark-600 p-14-medium md:p-16-medium dark:text-slate-200">
                      Navigate to Seller Dashboard
                      {/* <Button className="bg-purple-gradient">
                        <Link href={"/image-e-com/admin"}>
                          Add Image
                        </Link>
                      </Button> */}
                    </h2>
                  </div>
                  </Link>
                </div>
        ) : (
          <div className="profile-image-manipulation dark:bg-gradient-to-br dark:from-slate-500 dark:to-slate-700">
            <Link href={"/image-e-com/become-seller"}>
          <p className="p-14-medium md:p-16-medium dark:text-slate-200">BECOME A SELLER</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/seller.svg"
              alt="seller"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="h2-bold text-dark-600">
            <p className="p-14-medium md:p-16-medium dark:text-slate-200">Monetize Your Creativity With Imaginify!</p>
            <div className="md:flex md:justify-center md:items-center">
            {/* <Button className="bg-purple-gradient">
            <Link href={"/image-e-com/become-seller"}>
                Seller Form
              </Link> 
              </Button> */}
            </div>
            </h2>
          </div>
          </Link>
        </div>
        )}
      </section>

      <section className="mt-8 md:mt-14">
        <Collection
          images={images?.data}
          totalPages={images?.totalPages}
          page={page}
        />
      </section>
    </>
  );
};

export default Profile;
