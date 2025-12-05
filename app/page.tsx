"use client";

import { useState } from "react";
import MonthlyView from "@/components/MonthlyView";
import AppLayout from "@/components/AppLayout";
import Modal from "@/components/Modal";
import AddHabitForm from "@/components/AddHabitForm";

export default function TrackerPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <AppLayout title="Habit Tracker">
      <div className="h-full pb-16 md:pb-0 bg-white dark:bg-slate-900">
        <MonthlyView onAddHabit={() => setIsAddModalOpen(true)} />
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Habit"
        mobileFullScreen={true}
      >
        <AddHabitForm onSuccess={() => setIsAddModalOpen(false)} />
      </Modal>
    </AppLayout>
  );
}
