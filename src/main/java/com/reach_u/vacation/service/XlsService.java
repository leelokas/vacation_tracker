package com.reach_u.vacation.service;

import com.reach_u.vacation.domain.Vacation;
import com.reach_u.vacation.repository.VacationRepository;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

/**
 * Created by leelo on 19.11.16.
 */

@Service
@Transactional
public class XlsService {

    @Inject
    private VacationRepository vacationRepository;

    private final Logger log = LoggerFactory.getLogger(XlsService.class);

    private static final String[] header = {"Name", "Start Date", "End Date", "Duration", "Type", "Payment"};


    public Workbook generateXlsFile(Long[] ids, boolean showPaymentType){
        List<Vacation> itemList = vacationRepository.getVacationsByIds(ids);
        itemList.stream().forEach(v -> log.debug("Found vacation for export {}", v.toString()));

        Workbook wb = new HSSFWorkbook();
        Sheet sheet = wb.createSheet();
        generateHeaderRow(getHeaderCellStyle(wb), sheet, showPaymentType);
        generateItemRows(getDateCellStyle(wb), sheet, showPaymentType, itemList);
        for (int i = 0; i < header.length; ++i) {
            sheet.autoSizeColumn(i);
        }
        return wb;
    }

    private void generateHeaderRow(CellStyle headerRowStyle, Sheet sheet, boolean showPaymentType) {
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < header.length; ++i) {
            if (header[i].equals("Payment") && !showPaymentType) {
                continue;
            }
            addCellWithValueAndStyle(headerRowStyle, headerRow, i, header[i]);
        }
    }

    private void generateItemRows(CellStyle dateCellStyle, Sheet sheet, boolean showPaymentType, List<Vacation> itemList) {
        for (int i = 0; i < itemList.size(); ++i) {
            Row itemRow = sheet.createRow(i+1);
            addCellsToRow(itemRow, dateCellStyle, itemList.get(i), showPaymentType);
        }
    }

    private void addCellsToRow(Row row, CellStyle dateCellStyle, Vacation item, boolean showPaymentType) {
        row.createCell(0, CellType.STRING).setCellValue(item.getOwner().getFullName());

        Date startDate = Date.from(item.getStartDate().atStartOfDay(ZoneId.systemDefault()).toInstant());
        addCellWithValueAndStyle(dateCellStyle, row, 1, startDate);

        if (item.getEndDate() != null) {
            Date endDate = Date.from(item.getEndDate().atStartOfDay(ZoneId.systemDefault()).toInstant());
            addCellWithValueAndStyle(dateCellStyle, row, 2, endDate);
            row.createCell(3, CellType.NUMERIC).setCellValue(getDurationInDays(item.getStartDate(), item.getEndDate()));
        }

        row.createCell(4, CellType.STRING).setCellValue(item.getType().toString());
        if (showPaymentType) {
            row.createCell(5, CellType.STRING).setCellValue(item.getPayment().toString());
        }
    }

    private CellStyle getHeaderCellStyle(Workbook wb) {
        CellStyle headerRowStyle = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        headerRowStyle.setFont(font);
        headerRowStyle.setBorderBottom(BorderStyle.THIN);
        headerRowStyle.setAlignment(HorizontalAlignment.CENTER);
        return headerRowStyle;
    }

    private CellStyle getDateCellStyle(Workbook wb) {
        CellStyle dateCellStyle = wb.createCellStyle();
        CreationHelper createHelper = wb.getCreationHelper();
        dateCellStyle.setDataFormat(createHelper.createDataFormat().getFormat("dd/mm/yy"));
        return dateCellStyle;
    }

    private Long getDurationInDays(LocalDate start, LocalDate end) {
        if (end != null) {
            return start.until(end, ChronoUnit.DAYS) + 1;
        }
        return null;
    }

    private void addCellWithValueAndStyle(CellStyle style, Row row, int column, String value) {
        getCellWithStyle(style, row, column).setCellValue(value);
    }

    private void addCellWithValueAndStyle(CellStyle style, Row row, int column, Date value) {
        getCellWithStyle(style, row, column).setCellValue(value);
    }

    private Cell getCellWithStyle(CellStyle style, Row row, int column) {
        Cell cell = row.createCell(column, CellType.STRING);
        cell.setCellStyle(style);
        return cell;
    }
}

