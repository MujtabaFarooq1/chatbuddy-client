import React, { useRef } from "react";
import { Form, Input, Button, Modal, Upload, message } from "antd";
import "./addGameModal.css";
import { addNewGame } from "../../actions/dbHelper";
import { useHistory } from "react-router-dom";

function AppGameModal({ isModalVisible, setIsModalVisible }) {
  const formRef = useRef();
  const history = useHistory();
  const clearFormData = () => {
    formRef.current.resetFields();
  };

  const handleAddGame = async (formData) => {
    if (
      !!!formData.title ||
      !!!formData.description ||
      !!!formData.gameCode ||
      !!!formData.gameImg
    ) {
      return alert("Kindly fill all the fields to add game!");
    }
    return await addNewGame(formData);
  };

  return (
    <div>
      <Modal
        title="Add New Game!"
        visible={isModalVisible}
        onOk={() => {
          console.log("save img data");
        }}
        labelCol={{
          span: 4,
        }}
        wrapperCol={{
          span: 18,
        }}
        layout="horizontal"
        initialValues={{
          size: "default",
        }}
        size={"default"}
        footer={false}
        onCancel={() => {
          setIsModalVisible(false);
        }}
      >
        <div className="addGameModal__formContainer">
          <Form
            ref={formRef}
            style={{ overFlow: "auto" }}
            onFinish={(formData) => {
              handleAddGame(formData).then(() => {
                history.push("/games");
              });
            }}
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

            <Form.Item name="gameImg" label="Game Image">
              <Input />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea />
            </Form.Item>

            <Form.Item name="gameCode" label="Game Code" className="codeArea">
              <Input.TextArea rows={10} />
            </Form.Item>

            <Form.Item label="Actions">
              <Button
                onClick={() => {
                  setIsModalVisible(false);
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
                Add Game
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}

export default AppGameModal;
