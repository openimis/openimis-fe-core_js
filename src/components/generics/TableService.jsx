import React, { Fragment } from "react";
import clsx from "clsx";
import { injectIntl } from "../../helpers/i18n";
import { Box, Table as MUITable, TableRow, TableHead, TableBody, TableCell } from "@mui/material";
import FormattedMessage from "./FormattedMessage";
import withModulesManager from "../../helpers/modules";
import ServiceTableBase, {
  StyledServiceTable,
  serviceTableColumns,
  renderServiceItemCells,
  ServiceTableTitle,
  ServiceTablePager,
  ServiceTableLoader,
} from "./ServiceTableBase";

const StyledTableService = StyledServiceTable;

class Table extends ServiceTableBase {
  shouldShowSubServices = (i, iidx, formatters) => {
    const firstFormatterResult = formatters[0]?.(i, iidx);
    const value = firstFormatterResult?.props?.children?.props?.children?.props?.value;
    return value != undefined && value.packagetype != undefined && value.packagetype !== "S";
  };

  renderSubServiceRows = (i, iidx, formatters) => {
    if (!formatters?.length) return null;
    return formatters.flatMap((formatter, sfidx) => {
      const rows = formatter(i, iidx);
      if (!rows) return [];
      const rowList = Array.isArray(rows) ? rows : [rows];
      return rowList
        .filter((row) => row?.props?.children)
        .map((row, rowIdx) => (
          <TableRow key={`sub-${iidx}-${sfidx}-${rowIdx}`}>{React.Children.toArray(row.props.children)}</TableRow>
        ));
    });
  };

  render() {
    const { module, size, items, subServicesItemsFormatters } = this.props;
    const {
      aligns,
      headerSpans,
      colSpans,
      localHeaders,
      localPreHeaders,
      localItemFormatters,
      localSubServiceHeaders,
      rowsPerPage,
    } = serviceTableColumns(this.props);
    const localSubServicesItemsFormatters = [...(subServicesItemsFormatters || [])];
    return (
      <StyledTableService>
        <Box sx={{ position: "relative", overflow: "auto" }}>
          <ServiceTableTitle header={this.props.header} />
          <MUITable className="table" size={size}>
            {!!localPreHeaders && localPreHeaders.length > 0 && (
              <TableHead>
                <TableRow>
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
                </TableRow>
              </TableHead>
            )}

            <TableBody>
              {items &&
                items.length > 0 &&
                items.map((i, iidx) => {
                  const showSubServices = this.shouldShowSubServices(i, iidx, localItemFormatters);

                  if (i.claimlinkedService != undefined) {
                    return (
                      <Fragment key={`row-${iidx}`}>
                        {iidx === 0 && (
                          <TableRow>
                            <TableCell className="tableHeader">
                              <FormattedMessage module={module} id={localHeaders[0]} />
                            </TableCell>
                            <TableCell className="tableHeader">
                              <FormattedMessage module={module} id={localHeaders[1]} />
                            </TableCell>
                            <TableCell className="tableHeader">
                              <FormattedMessage module={module} id={localHeaders[2]} />
                            </TableCell>
                            <TableCell className="tableHeader">
                              <FormattedMessage module={module} id={localHeaders[3]} />
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          {renderServiceItemCells(this.props, i, iidx, localItemFormatters, aligns, colSpans)}
                        </TableRow>
                        {showSubServices && (
                          <Fragment>
                            <TableRow>
                              {localSubServiceHeaders.map((h, idx) => (
                                <TableCell key={`sub-header-${iidx}-${idx}`} className="tableHeader">
                                  <FormattedMessage module={module} id={h} />
                                </TableCell>
                              ))}
                            </TableRow>
                            {this.renderSubServiceRows(i, iidx, localSubServicesItemsFormatters)}
                          </Fragment>
                        )}
                      </Fragment>
                    );
                  }

                  const cleanedHeaders = localHeaders.filter(Boolean);
                  return (
                    <Fragment key={`row-${iidx}`}>
                      {iidx === 0 && cleanedHeaders.length > 0 && (
                        <TableRow>
                          {cleanedHeaders.map((header, index) => (
                            <TableCell key={`header-${index}`} className="tableHeader">
                              <FormattedMessage module={module} id={header} />
                            </TableCell>
                          ))}
                        </TableRow>
                      )}
                      <TableRow>
                        {renderServiceItemCells(this.props, i, iidx, localItemFormatters, aligns, colSpans)}
                      </TableRow>
                      {showSubServices && (
                        <TableRow>
                          <TableCell colSpan={cleanedHeaders.length || 1}>
                              <TableRow>
                                {localSubServiceHeaders.map((h, idx) => (
                                  <TableCell 
                                  key={`sub-header-${iidx}-${idx}`} className="tableHeader">
                                    <FormattedMessage module={module} id={h} />
                                  </TableCell>
                                ))}
                              </TableRow>
                            {this.renderSubServiceRows(i, iidx, localSubServicesItemsFormatters)}
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
            </TableBody>

            <ServiceTablePager {...this.props} colSpan={localItemFormatters.length} rowsPerPage={rowsPerPage} />
          </MUITable>
          <ServiceTableLoader items={items} fetching={this.props.fetching} error={this.props.error} />
        </Box>
      </StyledTableService>
    );
  }
}

export { StyledTableService };
export default withModulesManager(injectIntl(Table));
