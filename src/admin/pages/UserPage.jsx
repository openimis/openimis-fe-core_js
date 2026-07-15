import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme, styled } from "@mui/material/styles";
import { withModulesManager, combine, withHistory, historyPush, useTranslations } from "@openimis/fe-core";
import UserForm from "../components/UserForm";
import { createUser, updateUser } from "../actions";
import { RIGHT_USER_ADD, RIGHT_USER_EDIT } from "../constants";

const StyledDiv = styled("div")(({ theme }) => ({
  ...(theme.page ?? {}),
}));

const UserPage = (props) => {
  const { modulesManager, history, match } = props;
  const rights = useSelector((state) => state.core?.user?.i_user?.rights ?? []);
  const [resetKey, setResetKey] = useState(Date.now());
  const { formatMessageWithValues } = useTranslations("admin", modulesManager);
  const dispatch = useDispatch();
  const add = () => {
    setResetKey(Date.now());
    historyPush(modulesManager, history, "admin.userNew");
  };

  const save = (user) => {
    if (!user.id) {
      dispatch(createUser(modulesManager, user, formatMessageWithValues("user.createUser.mutationLabel")));
    } else {
      dispatch(updateUser(modulesManager, user, formatMessageWithValues("user.updateUser.mutationLabel")));
    }
  };
  return (
    <StyledDiv>
      <UserForm
        key={resetKey}
        readOnly={match.params.user_id ? !rights.includes(RIGHT_USER_EDIT) : !rights.includes(RIGHT_USER_ADD)}
        userId={match.params.user_id}
        back={() => historyPush(modulesManager, history, "admin.users")}
        add={rights.includes(RIGHT_USER_ADD) ? add : null}
        save={rights.includes(RIGHT_USER_EDIT) ? save : null}
      />
    </StyledDiv>
  );
};

const enhance = combine(withHistory, withModulesManager);

export { StyledDiv };
export default enhance(UserPage);
