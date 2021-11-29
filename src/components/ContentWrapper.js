import React from "react";
import { Layout } from "antd";

const { Content } = Layout;

const ContentWrapper = ({ children }) => {
  return (
    <div className="content-wrapper">
      <Content>{children}</Content>
    </div>
  );
};

export default ContentWrapper;
