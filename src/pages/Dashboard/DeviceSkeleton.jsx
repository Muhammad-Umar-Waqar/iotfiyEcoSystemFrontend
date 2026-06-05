import Skeleton from "@mui/material/Skeleton";

export default function DeviceSkeleton() {
  return (
    <div className="freezer-card-container freezer-card-skeleton">
      <div className="freezer-card-content">
        
        {/* Top section */}
        <div className="flex items-center justify-between">
            <div>
          <Skeleton variant="text" width={96} height={14} />
          <Skeleton variant="text" width={128} height={24} />
          </div>

        
          <Skeleton variant="text" width={90} height={34} sx={{ borderRadius: "5px" }} />
        

        </div>

        {/* Middle */}
        <div className="flex items-center justify-between ">
            <div className="flex items-center">  
          <Skeleton variant="circular" width={40} height={40} className="mr-3" />
          <div>
            <Skeleton variant="text" width={65} height={14} />
            <Skeleton variant="text" width={50} height={28} />
          </div>
            </div>

            <div className="flex items-center">  
          <Skeleton variant="circular" width={40} height={40} className="mr-3" />
          <div>
            <Skeleton variant="text" width={65} height={14} />
            <Skeleton variant="text" width={50} height={28} />
          </div>
            </div>
        </div>

        {/* Bottom */}
        {/* <div className="flex justify-between">
          <Skeleton variant="text" width={80} height={16} />
          <Skeleton variant="text" width={80} height={16} />
        </div> */}

      </div>
    </div>
  );
}
