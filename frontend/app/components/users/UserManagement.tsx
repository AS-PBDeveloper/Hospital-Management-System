import { authClient } from "@/lib/auth-client";
import type { Role, User } from "@/types";
import { useState } from "react";

interface UserManagementProps {
  role: Role;
  title: string;
  description: string;
}
const UserManagement = ({ role, title, description }: UserManagementProps) => {
  const [page, setPage] = useState(1);
  const fetchQueryKey = ["users", role, page];
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const { data: session } = authClient.useSession();

  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
};

export default UserManagement;
