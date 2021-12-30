import { Feed } from "../../components";
import { useRouter } from "next/router";

const CategoryPage = () => {
  const router = useRouter()
  const {categoryId} = router.query

  return (
      <Feed categoryId={categoryId}/>
  );
};

export default CategoryPage;
