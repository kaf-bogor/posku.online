import { useRouter } from 'next/router';

const NewsDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <h1>News Detail</h1>
      <p>Details for news ID: {id}</p>
      {/* Fetch and display news details using the ID */}
    </div>
  );
};

export default NewsDetailPage;
