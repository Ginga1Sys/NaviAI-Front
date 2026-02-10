import MyPostListPage from '../pages/dashboard/my_post_list';
import CommonHeader from '../pages/dashboard/CommonHeader';

export const metadata = {
  title: 'マイ投稿',
};

export default function Page() {
  return (
    <>
      <CommonHeader />
      <main>
        <MyPostListPage />
      </main>
    </>
  );
}
