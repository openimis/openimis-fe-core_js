import React from "react";
import clsx from "clsx";
import { injectIntl } from "../../helpers/i18n";
import { Box, Table as MUITable, TableBody, TableCell } from "@mui/material";
import FormattedMessage from "./FormattedMessage";
import withModulesManager from "../../helpers/modules";
import ServiceTableBase, { StyledServiceTable } from "./ServiceTableBase";

const StyledTableServiceReview = StyledServiceTable;

class Table extends ServiceTableBase {
  // The item's own identifier when it has one, its position otherwise.
  rowKey = (i, iidx) => this.itemIdentifier(i) ?? `row-${iidx}`;

  render() {
    const { module, size, items, subServicesItemsFormattersReview } = this.props;
    const {
      aligns,
      headerSpans,
      colSpans,
      localHeaders,
      localPreHeaders,
      localItemFormatters,
      localSubServiceHeaders,
      rowsPerPage,
    } = this.columns();
    const localsubServicesItemsFormattersReview = [...subServicesItemsFormattersReview];
    return (
      <StyledTableServiceReview>
        <Box sx={{ position: "relative", overflow: "auto" }}>
          {this.renderTitle()}
          <MUITable className="table" size={size}>
            {!!localPreHeaders && localPreHeaders.length > 0 && (
              <table style={{ width: "100%" }}>
                <tr>
                  {localPreHeaders.map((h, idx) => {
                    if (headerSpans.length > idx && !headerSpans[idx]) return null;
                    return (
                      <TableCell
                        colSpan={headerSpans.length > idx ? headerSpans[idx] : 1}
                        className={clsx("tableHeader", aligns.length > idx && aligns[idx])}
                        key={`preh-${idx}`}
                      >
                        {!!h && h}
                      </TableCell>
                    );
                  })}
                </tr>
              </table>
            )}

            <TableBody>
              {items &&
                items.length > 0 &&
                items.map((i, iidx) => {
                  if (i.claimlinkedService != undefined) {
                    console.log(i);
                    return (
                      <Box key={this.rowKey(i, iidx)} style={{ width: "100%" }}>
                        <table style={{ width: "100%" }}>
                          {items.length - iidx == items.length && (
                            <tr>
                              <TableCell>
                                <FormattedMessage module={module} id={localHeaders[0]} />
                              </TableCell>
                              <TableCell>
                                <FormattedMessage module={module} id={localHeaders[1]} />
                              </TableCell>
                              <TableCell>
                                <FormattedMessage module={module} id={localHeaders[2]} />
                              </TableCell>
                              <TableCell>
                                <FormattedMessage module={module} id={localHeaders[3]} />
                              </TableCell>
                              <TableCell>
                                <FormattedMessage module={module} id={localHeaders[4]} />
                              </TableCell>
                              <TableCell>
                                <FormattedMessage module={module} id={localHeaders[5]} />
                              </TableCell>
                              <TableCell>
                                <FormattedMessage module={module} id={localHeaders[6]} />
                              </TableCell>
                            </tr>
                          )}
                          <tr>
                            {this.renderItemCells(i, iidx, localItemFormatters, aligns, colSpans)}
                          </tr>
                        </table>
                        {localItemFormatters[0](i, iidx).props.children.props.value != undefined &&
                          localItemFormatters[0](i, iidx).props.children.props.value.packagetype != undefined &&
                          localItemFormatters[0](i, iidx).props.children.props.value.packagetype !== "S" && (
                            <table style={{ marginTop: 10, width: "90%" }}>
                              <tr>
                                <TableCell>
                                  <FormattedMessage module={module} id={localSubServiceHeaders[0]} />
                                </TableCell>
                                <TableCell>
                                  <FormattedMessage module={module} id={localSubServiceHeaders[1]} />
                                </TableCell>
                                <TableCell>
                                  <FormattedMessage module={module} id={localSubServiceHeaders[2]} />
                                </TableCell>
                                <TableCell>
                                  <FormattedMessage module={module} id={localSubServiceHeaders[3]} />
                                </TableCell>
                              </tr>
                              {localsubServicesItemsFormattersReview &&
                                localsubServicesItemsFormattersReview.map((s, sfidx) => {
                                  return s(i, iidx);
                                })}
                            </table>
                          )}
                      </Box>
                    );
                  } else {
                    return (
                      <Box key={this.rowKey(i, iidx)} style={{ width: "100%" }}>
                        <table style={{ width: "100%" }}>
                          <tr>
                            {this.renderItemCells(i, iidx, localItemFormatters, aligns, colSpans)}
                          </tr>
                        </table>
                        {localItemFormatters[0](i, iidx).props.children.props.value != undefined &&
                          localItemFormatters[0](i, iidx).props.children.props.value.packagetype != undefined &&
                          localItemFormatters[0](i, iidx).props.children.props.value.packagetype !== "S" && (
                            <table style={{ marginTop: 10, width: "90%" }}></table>
                          )}
                      </Box>
                    );
                  }
                })}
            </TableBody>

            {this.renderPager(localItemFormatters.length, rowsPerPage)}
          </MUITable>
          {this.renderLoader()}
        </Box>
      </StyledTableServiceReview>
    );
  }
}

export { StyledTableServiceReview };
export default withModulesManager(injectIntl(Table));
