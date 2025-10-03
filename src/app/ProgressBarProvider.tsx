"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { useIsFetching } from "@tanstack/react-query";
import { useEffect } from "react";
import NProgress from "nprogress";

const ProgressBarProvider = ({ children }: { children: React.ReactNode }) => {
  const isFetching = useIsFetching();

  useEffect(() => {
    NProgress.configure({ showSpinner: false });
  }, []);

  useEffect(() => {
    if (isFetching) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [isFetching]);

  return (
    <>
      {children}
      <ProgressBar
        height="3px"
        color="#7968EE"
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
};

export default ProgressBarProvider;
