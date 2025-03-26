"use client"

import { useState, useEffect } from 'react';
import { getUserRole, updateUserRole } from '@/lib/actions/user.actions';
import toast from 'react-hot-toast';

export function UserRole({ user }: { user: { _id: string } }) {
    const [isSeller, setIsSeller] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const role = await getUserRole(user._id);
                setIsSeller(role !== "user");
            } catch (error) {
                console.error("Failed to fetch user role:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRole();
    }, [user._id]);

    const handleToggle = async () => {
        try {
          const updatedUser = await updateUserRole(user._id);
          setIsSeller(updatedUser.role === "admin");
        } catch (error) {
          console.error("Failed to update role:", error);
          toast.error("Failed to update role");
        }
      };

    if (loading) return <div>Loading role status...</div>;

    return (
        <div>
            <p className='dark:text-white text-slate-700 mb-2'>
                Turn the button to become a seller
            </p>
            <div className="flex items-center">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isSeller}
                        onChange={handleToggle}
                        disabled={loading}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
        </div>
    );
}

export default UserRole;