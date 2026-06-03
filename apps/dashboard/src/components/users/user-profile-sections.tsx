"use client";

// Components
import ChangeUserPasswordForm from "@/components/users/change-user-password-form";
import ChangeUserRoleForm from "@/components/users/change-user-role-form";
import DeleteUserCard from "@/components/users/delete-user-card";
import EditUserGeneralForm from "@/components/users/edit-user-general-form";

type UserProfileSectionsProps = {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  isOnlyAdmin: boolean;
};

export default function UserProfileSections({
  user,
  isOnlyAdmin,
}: UserProfileSectionsProps) {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <EditUserGeneralForm user={user} />
      <ChangeUserPasswordForm userId={user.id} />
      <ChangeUserRoleForm
        userId={user.id}
        currentRole={user.role}
        isOnlyAdmin={isOnlyAdmin}
      />
      <DeleteUserCard
        userId={user.id}
        userEmail={user.email}
        userName={user.name ?? "Unnamed user"}
        isOnlyAdmin={isOnlyAdmin}
      />
    </div>
  );
}
