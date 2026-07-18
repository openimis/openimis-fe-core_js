import React, { useEffect, useState } from "react";
import { withModulesManager, useTranslations, PublishedComponent, ProgressOrError } from "@openimis/fe-core";
import GetIconComponent from "../../helpers/icons";

const DeleteIcon = GetIconComponent("Delete");
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
const AddIcon = GetIconComponent("Add");
import {
  TableContainer,
  TableHead,
  TableBody,
  Table,
  TableCell,
  TableRow,
  TableFooter,
  Paper,
  Button,
  IconButton,
} from "@mui/material";
import { fetchDataFromDistrict, clearDistrictData } from "../actions";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  "& .footer": {
    marginInline: 16,
    marginBlock: 12,
  },
  "& .headerTitle": theme.table?.title ?? {},
  "& .actionCell": {
    width: 60,
  },
  "& .header": theme.table?.header ?? {},
}));

const groupVillagesByMunicipality = (villages) => {
  const result = [];
  villages?.forEach((village) => {
    if (!result.find((x) => x.parent?.id === village.parent?.id)) {
      result.push({ parent: village.parent, entities: [] });
    }

    result.find((x) => x.parent?.id === village.parent?.id).entities.push(village);
  });

  result.sort((a, b) => (a.parent ? a.parent?.id > b.parent?.id : -1));
  return result;
};

const EnrolmentVillagesPicker = (props) => {
  const { modulesManager, readOnly, villages, onChange, districts, isOfficerPanelEnabled } = props;
  const dispatch = useDispatch();
  const [items, setItems] = useState([]);
  const { formatMessage } = useTranslations("admin.EnrolmentZonesPicker", modulesManager);
  const pickedDistrictsUuids = districts && districts.map((district) => district.uuid);
  const savedEOVillages = useSelector((store) => store.admin.user?.officerVillages);
  const isUserEdited = useSelector((store) => store.admin.user?.id);
  const [wasEmpty, setWasEmpty] = useState(false);
  const { districtMunAndVil, fetchedDistrictMunAndVil, fetchingDistrictMunAndVil, errorDistrictMunAndVil } =
    useSelector((store) => store.admin);

  const handleChange = (newItems) => {
    const villageIds = newItems.reduce((acc, item) => (item.entities ? acc.concat(item.entities) : acc), []);
    onChange(villageIds);
  };

  const onRemoveRow = (row) => {
    handleChange(items.filter((i) => i.parent?.id !== row.parent?.id));
  };

  useEffect(() => {
    setItems(groupVillagesByMunicipality(villages));
  }, [villages]);

  const onInsertRow = () => {
    setItems([...items, {}]);
  };

  const onSelectParent = (item, parent) => {
    const rowItem = item;
    rowItem.parent = parent;
    setItems([...items]);
  };

  const onVillagesChange = (item, entities) => {
    const rowItem = item;
    rowItem.entities = entities;
    handleChange(items);
  };

  const createRow = (parent) => {
    const {
      children: { edges },
    } = parent;
    const entities = edges?.map((edge) => edge.node) ?? [];
    const savedEntities = entities.filter((entity) =>
      savedEOVillages?.some((village) => entity.uuid === village?.uuid),
    );
    const createdRow = {};

    createdRow.parent = parent;

    if (!isUserEdited) {
      createdRow.entities = entities;
      return createdRow;
    }

    if (isUserEdited && savedEntities && wasEmpty) {
      createdRow.entities = entities;
      return createdRow;
    }

    if (entities.find((entity) => savedEntities.some((savedEntity) => savedEntity.uuid !== entity.uuid))) {
      createdRow.entities = savedEntities;
    } else {
      createdRow.entities = entities;
    }
    return createdRow;
  };

  const rescheduleItems = (rows) => {
    setItems([...items, ...rows]);
    handleChange([...items, ...rows]);
  };

  const clearItems = () => {
    setItems([]);
    handleChange([]);
    dispatch(clearDistrictData());
  };

  const executeNewRows = (newRows, uniqueRows) => {
    if (!items.length) {
      rescheduleItems(newRows);
    } else {
      rescheduleItems(uniqueRows);
    }
  };

  const filterParents = (options) => options.filter((p) => !items.some((i) => i.parent?.id === p.id));

  const filterVillages = (options) =>
    options.filter((option) => !villages?.some((village) => village?.id === option.id));

  useEffect(() => {
    if (districts?.length) {
      dispatch(fetchDataFromDistrict(pickedDistrictsUuids));
    } else setWasEmpty(true);

    return clearItems();
  }, [districts]);

  useEffect(() => {
    if (fetchedDistrictMunAndVil) {
      const createdRows = districtMunAndVil.map((mun) => createRow(mun));
      const uniqueRows = createdRows.filter((row) => !items.some((i) => i.parent.uuid === row.parent.uuid));
      executeNewRows(createdRows, uniqueRows);
    }
  }, [districtMunAndVil]);

  useEffect(() => {
    if (isOfficerPanelEnabled) {
      clearItems();
    }
  }, [isOfficerPanelEnabled]);

  return (
    <StyledTableContainer component={Paper}>
      <Table size="small">
        <TableHead className="header">
          <TableRow className="headerTitle">
            <TableCell>{formatMessage("table.municipality")}</TableCell>
            <TableCell>{formatMessage("table.villages")}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <ProgressOrError progress={fetchingDistrictMunAndVil} error={errorDistrictMunAndVil} />
          {items.map((item, idx) => (
            <TableRow key={item.parent?.id ?? `row-${idx}`}>
              <TableCell>
                {item.parent ? (
                  `${item.parent.code} ${item.parent.name}`
                ) : (
                  <PublishedComponent
                    pubRef="location.LocationPicker"
                    parentLocations={pickedDistrictsUuids}
                    onChange={(parent) => onSelectParent(item, parent)}
                    required
                    filterOptions={filterParents}
                    value={item.parent}
                    locationLevel={2}
                  />
                )}
              </TableCell>
              <TableCell>
                <PublishedComponent
                  fullWidth
                  pubRef="location.LocationPicker"
                  parentLocation={item.parent}
                  parentLocations={[item.parent?.uuid]}
                  readOnly={readOnly}
                  required
                  multiple
                  value={item.entities}
                  onChange={(value) => onVillagesChange(item, value)}
                  filterOptions={filterVillages}
                  locationLevel={3}
                />
              </TableCell>
              <TableCell className="actionCell">
                <IconButton disabled={readOnly} onClick={() => onRemoveRow(item)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <Button
            disabled={readOnly}
            variant="contained"
            onClick={onInsertRow}
            startIcon={<AddIcon />}
            className="footer"
          >
            {formatMessage("table.newRow")}
          </Button>
        </TableFooter>
      </Table>
    </StyledTableContainer>
  );
};

export { StyledTableContainer };
export default withModulesManager(EnrolmentVillagesPicker);
