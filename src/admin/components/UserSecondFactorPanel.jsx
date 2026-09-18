import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { styled } from "@mui/material/styles";
import { Button, Grid, Paper, Typography } from "@mui/material";

import ConfirmDialog from "../../components/dialogs/ConfirmDialog";
import { decodeId } from "../../helpers/api";
import { useTranslations } from "../../helpers/i18n";
import { useModulesManager } from "../../helpers/modules";
import { useGraphqlMutation } from "../../helpers/hooks";
import { RIGHT_USER_RESET_SECOND_FACTOR } from "../constants";
import { fetchUser } from "../actions";

const RESET = `
  mutation resetUserSecondFactor($input: ResetUserSecondFactorMutationInput!) {
    resetUserSecondFactor(input: $input) {
      clientMutationId
      internalId
    }
  }
`;

// core_Mutation_Log.status: 0 received, 1 error, 2 success.
const MUTATION_SUCCESS = 2;

const StyledPaper = styled(Paper)(({ theme }) => ({
  ...(theme.paper?.paper ?? {}),
  "& .title": theme.paper?.title ?? {},
  "& .item": theme.paper?.item ?? {},
}));

const UserSecondFactorPanel = (props) => {
  const { edited } = props;
  const modulesManager = useModulesManager();
  const { formatMessage, formatMessageWithValues } = useTranslations("admin.UserSecondFactorPanel", modulesManager);
  const dispatch = useDispatch();
  const rights = useSelector((state) => state.core?.user?.i_user?.rights ?? []);
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);
  const reset = useGraphqlMutation(RESET);

  const secondFactor = modulesManager.getConf("fe-core", "App.secondFactor", false);
  if (!secondFactor || !edited?.id) return null;

  // The form's readOnly carries three things: the update right, a mutation still
  // in flight and a deleted user. Only the first is ignored here - getting past a
  // second factor is the one thing a password reset cannot do, so it has a right
  // of its own. The other two lock the form, and they lock this with it.
  const canReset =
    !!edited.hasSecondFactor &&
    !edited.validityTo &&
    !edited.clientMutationId &&
    rights.includes(RIGHT_USER_RESET_SECOND_FACTOR);

  const onConfirm = async (confirmed) => {
    setConfirming(false);
    if (!confirmed) return;
    setFailed(false);
    try {
      const outcome = await reset.mutate({
        uuid: decodeId(edited.id),
        clientMutationLabel: formatMessageWithValues("reset.mutationLabel", { username: edited.username }),
      });
      // The mutation resolves with the log row it waited for, and gives up after
      // ten polls. Anything short of a success row leaves the outcome unknown,
      // which the administrator has to be told rather than left to infer.
      if (outcome?.status !== MUTATION_SUCCESS) {
        setFailed(true);
      }
    } catch (err) {
      setFailed(true);
    } finally {
      // Whatever the outcome, the status shown is re-read from the server.
      dispatch(fetchUser(modulesManager, edited.id));
    }
  };

  return (
    <StyledPaper>
      {confirming && (
        <ConfirmDialog
          confirm={{ title: formatMessage("resetDialog.title"), message: formatMessage("resetDialog.message") }}
          onConfirm={onConfirm}
        />
      )}
      <Grid container className="title">
        <Typography variant="h6">{formatMessage("title")}</Typography>
      </Grid>
      <Grid container className="item" spacing={2} alignItems="center">
        <Grid size="grow">
          <Typography>{formatMessage(edited.hasSecondFactor ? "enrolled" : "notEnrolled")}</Typography>
          {failed && <Typography color="error">{formatMessage("error")}</Typography>}
        </Grid>
        {canReset && (
          <Grid>
            <Button variant="contained" color="primary" disabled={reset.isLoading} onClick={() => setConfirming(true)}>
              {formatMessage("resetBtn")}
            </Button>
          </Grid>
        )}
      </Grid>
    </StyledPaper>
  );
};

export { StyledPaper };
export default UserSecondFactorPanel;
