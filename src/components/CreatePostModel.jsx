import React, { useState, useRef } from "react";
import { Form, Input, Button, Modal, Upload, message } from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";
import { useAuth } from "../context/auth-context";
import { createPostAsync } from "../actions/dbHelper";
import { useHistory } from "react-router-dom";
const { Dragger } = Upload;

function CreatePostModel({ isVisible, closeModel }) {
  const [postImages, setPostImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const formRef = useRef();
  const history = useHistory();

  const { curAuth } = useAuth();

  if (!isVisible && !closeModel) {
    return null;
  }

  const clearFormData = () => {
    setPostImages([]);
    formRef.current.resetFields();
  };

  const uploadProps = {
    multiple: true,
    onRemove: (file) => {
      setPostImages((prevImages) => {
        const index = prevImages.indexOf(file);
        const newFileList = prevImages.slice();
        newFileList.splice(index, 1);
        return [...newFileList];
      });
    },
    beforeUpload: (file) => {
      setPostImages((prevImages) => [...prevImages, file]);
    },
    fileList: postImages,
  };

  const handleSubmit = (formData) => {
    const { title, description, postImages } = formData;
    setLoading(true);

    const filteredImages = postImages?.fileList?.map((img) => {
      if (img?.originFileObj) {
        return img.originFileObj;
      }
      return img;
    });

    createPostAsync(curAuth.uid, {
      title,
      description,
      postImages: filteredImages,
    })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
        clearFormData();
        closeModel();
        history.push("/");
      });
  };

  return (
    <div>
      <Modal
        title="Create Post"
        visible={isVisible}
        style={{ top: 20 }}
        width={"70%"}
        onCancel={() => {
          closeModel();
        }}
        footer={null}
      >
        {!loading ? (
          <div className="createPostContainer" style={{ overFlow: "auto" }}>
            <Form
              ref={formRef}
              style={{ overFlow: "auto" }}
              onFinish={handleSubmit}
              labelCol={{
                span: 4,
              }}
              wrapperCol={{
                span: 14,
              }}
              layout="horizontal"
              initialValues={{
                size: "default",
              }}
              size={"default"}
            >
              <Form.Item name="title" label="Title">
                <Input />
              </Form.Item>

              <Form.Item name="description" label="Description">
                <Input.TextArea />
              </Form.Item>

              <Form.Item name="postImages" label="Images">
                <Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                  <p className="ant-upload-hint">
                    Support for a single or bulk upload. Strictly prohibit from
                    uploading company data or other band files
                  </p>
                </Dragger>
              </Form.Item>

              <Form.Item label="Actions">
                <Button
                  onClick={() => {
                    closeModel();
                    clearFormData();
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ marginLeft: "1rem" }}
                >
                  Create
                </Button>
              </Form.Item>
            </Form>
          </div>
        ) : (
          <h3>Creating Post Loading....</h3>
        )}
      </Modal>
    </div>
  );
}

export default CreatePostModel;
