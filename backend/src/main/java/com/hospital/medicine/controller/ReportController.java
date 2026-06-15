package com.hospital.medicine.controller;

import com.hospital.medicine.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/inventory")
    public ResponseEntity<byte[]> downloadInventoryReport() {
        byte[] report = reportService.generateInventoryReport();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=inventory_report.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(report);
    }

    @GetMapping("/import-export")
    public ResponseEntity<byte[]> downloadImportExportReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        byte[] report = reportService.generateImportExportReport(startDate, endDate);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=import_export_report.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(report);
    }

    @GetMapping("/expiry")
    public ResponseEntity<byte[]> downloadExpiryReport(
            @RequestParam(defaultValue = "30") int warningDays) {
        byte[] report = reportService.generateExpiryReport(warningDays);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=expiry_report.csv")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(report);
    }
}
