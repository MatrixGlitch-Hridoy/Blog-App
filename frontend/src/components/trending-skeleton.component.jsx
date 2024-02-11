const TrendingSkeleton = () => {
  return (
    <div className="flex gap-5 mb-8 w-full">
      <h1 className="h-12 w-12 bg-grey rounded-lg animate-pulse"></h1>
      <div className="w-full">
        <div className="h-4 bg-grey rounded-full mb-4 animate-pulse"></div>
        <div className="h-4 bg-grey rounded-full mb-4 animate-pulse"></div>
        <div className="h-4 bg-grey rounded-full mb-4 animate-pulse"></div>
        <div className="h-4 bg-grey rounded-full mb-4 animate-pulse"></div>
      </div>
    </div>
  );
};
export default TrendingSkeleton;
