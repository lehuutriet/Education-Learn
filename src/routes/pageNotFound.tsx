import { FC } from "react";
import { Link } from "react-router-dom";

interface PageNotFoundProps {}

const PageNotFound: FC<PageNotFoundProps> = ({}) => {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="w-1/2 h-1/2">
        <div className="mt-3 w-full flex flex-col items-center">
          <h3 className="text-uppercase">Sorry, Page not Found 😭</h3>
          <p className="mb-4">The page you are looking for not available!</p>
          <Link className="flex gap-2" to="../">
            <i className="mgc_arrow_left_line"></i>Go back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
