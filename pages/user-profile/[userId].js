import { useRouter } from "next/router";
import { UserProfile } from "../../components";
import HomeLayout from "../../Layout/HomeLayout";

export default function UserProfilePage() {
  const { query } = useRouter();

  return (
    <HomeLayout>
      <UserProfile userId={query.userId} />
    </HomeLayout>
  );
}
