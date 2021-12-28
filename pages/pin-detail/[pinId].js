import { PinDetail } from "../../components";
import { useRouter } from "next/router";
import HomeLayout from "../../Layout/HomeLayout";

const PinDetailPage = () => {
  const router = useRouter()
  const {pinId} = router.query

  return (
    <HomeLayout>
      <PinDetail pinId={pinId}/>
    </HomeLayout>
  );
};

export default PinDetailPage;
