// "use client";

// import { navLinks } from "@/constants";
// import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
// import Image from "next/image";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { Button } from "../ui/button";
// import { ThemeToggle } from "../Theme/ThemeToggle";
// import { useEffect } from "react";

// const Sidebar = () => {
//   const pathname = usePathname();

//   return (
//     <aside className="sidebar">
//       <div className="flex size-full flex-col gap-4">
//         {/* logo and theme icon section */}
//         <div className="flex">
//           <div>
//             <Link href="/" className="sidebar-logo">
//               <Image
//                 src="/assets/images/logo-text.svg"
//                 alt="logo"
//                 width={180}
//                 height={28}
//                 className=""
//               />
//               <div className="pr-3"></div>
//             </Link>
//           </div>
//           <div className="mt-1">
//             <ThemeToggle />
//           </div>
//         </div>
//         {/* other links of side bar */}
//         <nav className="sidebar-nav">
//           <SignedIn>
//             <ul className="sidebar-nav_elements">
//               {navLinks.slice(0, 8).map((link) => {
//                 const isActive = link.route === pathname;

//                 return (
//                   <li
//                     key={link.route}
//                     className={`sidebar-nav_element group ${
//                       isActive
//                         ? "bg-purple-gradient text-white"
//                         : "text-gray-700 dark:text-gray-300"
//                     }`}
//                   >
//                     <Link className="sidebar-link hover:text-slate-700" href={link.route}>
//                       <Image
//                         src={link.icon}
//                         alt="logo"
//                         width={24}
//                         height={24}
//                         className={`${isActive && "brightness-200"}`}
//                       />
//                       {link.label}
//                     </Link>
//                   </li>
//                 );
//               })}
//             </ul>

//             <ul className="sidebar-nav_elements -mt-2">
//               {navLinks.slice(8).map((link) => {
//                 const isActive = link.route === pathname;

//                 return (
//                   <li
//                     key={link.route}
//                     className={`sidebar-nav_element group ${
//                       isActive
//                         ? "bg-purple-gradient text-white"
//                         : "text-gray-700 dark:text-gray-300"
//                     }`}
//                   >
//                     <Link className="sidebar-link hover:text-slate-700" href={link.route}>
//                       <Image
//                         src={link.icon}
//                         alt="logo"
//                         width={24}
//                         height={24}
//                         className={`${isActive && "brightness-200"}`}
//                       />
//                       {link.label}
//                     </Link>
//                   </li>
//                 );
//               })}

//               <li className="flex-center cursor-pointer gap-2 pl-3 dark:text-white">
//                 <UserButton afterSignOutUrl="/" showName />
//               </li>
//             </ul>
//           </SignedIn>

//           <SignedOut>
//             <Button asChild className="button bg-purple-gradient bg-cover">
//               <Link href="/sign-in">Login</Link>
//             </Button>
//           </SignedOut>
//         </nav>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;



"use client";

import { navLinks } from "@/constants";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { ThemeToggle } from "../Theme/ThemeToggle";
import { useEffect } from "react";

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="flex size-full flex-col gap-4">
        {/* logo and theme icon section */}
        <div className="flex">
          <div>
            <Link href="/" className="sidebar-logo">
              <Image
                src="/assets/images/logo-text.svg"
                alt="logo"
                width={180}
                height={28}
                className=""
              />
              <div className="pr-3"></div>
            </Link>
          </div>
          <div className="mt-1">
            <ThemeToggle />
          </div>
        </div>
        {/* other links of side bar */}
        <nav className="sidebar-nav">
          <SignedIn>
            <ul className="sidebar-nav_elements mobile-scroll">
              {navLinks.slice(0, 8).map((link) => {
                const isActive = link.route === pathname;

                return (
                  <li
                    key={link.route}
                    className={`sidebar-nav_element group ${
                      isActive
                        ? "bg-purple-gradient text-white"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <Link className="sidebar-link hover:text-slate-700" href={link.route}>
                      <Image
                        src={link.icon}
                        alt="logo"
                        width={24}
                        height={24}
                        className={`${isActive && "brightness-200"}`}
                      />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <ul className="sidebar-nav_elements -mt-2 mobile-scroll">
              {navLinks.slice(8).map((link) => {
                const isActive = link.route === pathname;

                return (
                  <li
                    key={link.route}
                    className={`sidebar-nav_element group ${
                      isActive
                        ? "bg-purple-gradient text-white"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <Link className="sidebar-link hover:text-slate-700" href={link.route}>
                      <Image
                        src={link.icon}
                        alt="logo"
                        width={24}
                        height={24}
                        className={`${isActive && "brightness-200"}`}
                      />
                      {link.label}
                    </Link>
                  </li>
                );
              })}

              <li className="flex-center cursor-pointer gap-2 pl-3 dark:text-white">
                <UserButton afterSignOutUrl="/" showName />
              </li>
            </ul>
          </SignedIn>

          <SignedOut>
            <Button asChild className="button bg-purple-gradient bg-cover">
              <Link href="/sign-in">Login</Link>
            </Button>
          </SignedOut>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;