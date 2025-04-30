'use client';

import React from 'react';
import { EntryForm } from '@/components/EntryForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function EntryPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Add New Entry</h1>
      </div>

      <div className="mx-auto max-w-md">
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <EntryForm />
        </div>
      </div>
    </div>
  );
} 