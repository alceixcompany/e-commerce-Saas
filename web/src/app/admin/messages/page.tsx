'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchMessages } from '@/lib/slices/adminSlice';
import { FiMail, FiCalendar, FiUser, FiMessageSquare } from 'react-icons/fi';

export default function MessagesPage() {
    const dispatch = useAppDispatch();
    const { messages, isLoading, error } = useAppSelector((state) => state.admin);

    useEffect(() => {
        dispatch(fetchMessages());
    }, [dispatch]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-100">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-serif font-medium text-gray-900">Messages</h1>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-100 text-sm text-gray-500">
                    Total: {messages.length}
                </div>
            </div>

            <div className="grid gap-4">
                {messages.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <FiMail className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <p className="text-gray-500">No messages found</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message._id}
                            className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold uppercase text-sm">
                                        {message.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{message.subject}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <FiUser size={12} />
                                            <span>{message.name}</span>
                                            <span className="text-gray-300">•</span>
                                            <span>{message.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                    <FiCalendar size={12} />
                                    <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="pl-13 ml-13">
                                <p className="text-gray-600 text-sm leading-relaxed border-l-2 border-gray-100 pl-4">
                                    {message.message}
                                </p>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${message.status === 'new' ? 'bg-green-100 text-green-700' :
                                        message.status === 'read' ? 'bg-gray-100 text-gray-700' :
                                            'bg-blue-100 text-blue-700'
                                    }`}>
                                    {message.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
