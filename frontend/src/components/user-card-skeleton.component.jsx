const UserCardSkeleton = () => {
  return (
    <div className="flex gap-5 items-center mb-5">
      <div className="w-14 h-14 rounded-full bg-grey animate-pulse" />
      <div className="w-full">
        <div className="h-4 bg-grey rounded-full mb-4 animate-pulse"></div>
        <div className="h-4 bg-grey rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};
export default UserCardSkeleton;
