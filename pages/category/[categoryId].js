import { Feed } from "../../components";
import { useRouter } from "next/router";
import HomeLayout from "../../Layout/HomeLayout";

const CategoryPage = () => {
  const router = useRouter()
  const {categoryId} = router.query

  return (
    <HomeLayout>
      <Feed categoryId={categoryId}/>
    </HomeLayout>
  );
};

export default CategoryPage;
