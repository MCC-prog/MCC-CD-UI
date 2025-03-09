import React from 'react';
import withRouter from "../Components/Common/withRouter";

const NonAuthLayout = (props:any) => {
  return (
    <React.Fragment>{props.children}</React.Fragment>
  );
}

export default withRouter(NonAuthLayout)
