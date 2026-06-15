package com.hospital.medicine.service;

import com.hospital.medicine.entity.Medicine;
import com.hospital.medicine.entity.MedicineBatch;
import com.hospital.medicine.entity.StockExport;
import com.hospital.medicine.entity.StockImport;
import com.hospital.medicine.repository.MedicineBatchRepository;
import com.hospital.medicine.repository.MedicineRepository;
import com.hospital.medicine.repository.StockExportRepository;
import com.hospital.medicine.repository.StockImportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final MedicineRepository medicineRepository;
    private final MedicineBatchRepository batchRepository;
    private final StockImportRepository stockImportRepository;
    private final StockExportRepository stockExportRepository;

    @Transactional(readOnly = true)
    public byte[] generateInventoryReport() {
        List<Medicine> medicines = medicineRepository.findAllWithBatches();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out);

        // CSV Header
        writer.println("Mã thuốc,Tên thuốc,Loại,Nhà cung cấp,Đơn vị,Giá,Tồn kho,Hạn dùng gần nhất");

        for (Medicine medicine : medicines) {
            if (!medicine.getActive()) continue;

            String categoryName = medicine.getCategory() != null ? medicine.getCategory().getName() : "";
            String supplierName = medicine.getSupplier() != null ? medicine.getSupplier().getName() : "";
            LocalDate nearestExpiry = medicine.getBatches().stream()
                    .filter(b -> b.getRemainingQuantity() > 0)
                    .map(MedicineBatch::getExpiryDate)
                    .min(LocalDate::compareTo)
                    .orElse(null);

            writer.printf("%s,%s,%s,%s,%s,%.2f,%d,%s%n",
                    escapeCSV(medicine.getCode()),
                    escapeCSV(medicine.getName()),
                    escapeCSV(categoryName),
                    escapeCSV(supplierName),
                    escapeCSV(medicine.getUnit()),
                    medicine.getPrice(),
                    medicine.getTotalStock(),
                    nearestExpiry != null ? nearestExpiry.format(DateTimeFormatter.ISO_DATE) : ""
            );
        }

        writer.flush();
        return out.toByteArray();
    }

    @Transactional(readOnly = true)
    public byte[] generateImportExportReport(LocalDateTime startDate, LocalDateTime endDate) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out);

        // Imports section
        writer.println("=== BÁO CÁO NHẬP KHO ===");
        writer.println("Mã phiếu,Ngày nhập,Nhà cung cấp,Người nhập,Tổng tiền,Ghi chú");

        List<StockImport> imports = stockImportRepository.findByDateRange(startDate, endDate, PageRequest.of(0, 10000)).getContent();
        for (StockImport si : imports) {
            writer.printf("%s,%s,%s,%s,%.2f,%s%n",
                    escapeCSV(si.getImportCode()),
                    si.getImportDate().format(DateTimeFormatter.ISO_DATE_TIME),
                    escapeCSV(si.getSupplier() != null ? si.getSupplier().getName() : ""),
                    escapeCSV(si.getImportedBy().getFullName()),
                    si.getTotalAmount(),
                    escapeCSV(si.getNotes() != null ? si.getNotes() : "")
            );
        }

        writer.println();
        writer.println("=== BÁO CÁO XUẤT KHO ===");
        writer.println("Mã phiếu,Ngày xuất,Bệnh nhân,Người xuất,Tổng tiền,Ghi chú");

        List<StockExport> exports = stockExportRepository.findByDateRange(startDate, endDate, PageRequest.of(0, 10000)).getContent();
        for (StockExport se : exports) {
            writer.printf("%s,%s,%s,%s,%.2f,%s%n",
                    escapeCSV(se.getExportCode()),
                    se.getExportDate().format(DateTimeFormatter.ISO_DATE_TIME),
                    escapeCSV(se.getPatient().getFullName()),
                    escapeCSV(se.getExportedBy().getFullName()),
                    se.getTotalAmount(),
                    escapeCSV(se.getNotes() != null ? se.getNotes() : "")
            );
        }

        writer.flush();
        return out.toByteArray();
    }

    @Transactional(readOnly = true)
    public byte[] generateExpiryReport(int warningDays) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out);

        writer.println("=== THUỐC ĐÃ HẾT HẠN ===");
        writer.println("Mã thuốc,Tên thuốc,Số lô,Số lượng còn,Ngày hết hạn");

        List<MedicineBatch> expiredBatches = batchRepository.findExpiredBatches(LocalDate.now());
        for (MedicineBatch batch : expiredBatches) {
            writer.printf("%s,%s,%s,%d,%s%n",
                    escapeCSV(batch.getMedicine().getCode()),
                    escapeCSV(batch.getMedicine().getName()),
                    escapeCSV(batch.getBatchNumber()),
                    batch.getRemainingQuantity(),
                    batch.getExpiryDate().format(DateTimeFormatter.ISO_DATE)
            );
        }

        writer.println();
        writer.println("=== THUỐC SẮP HẾT HẠN ===");
        writer.println("Mã thuốc,Tên thuốc,Số lô,Số lượng còn,Ngày hết hạn,Còn lại (ngày)");

        List<MedicineBatch> expiringSoonBatches = batchRepository.findExpiringSoonBatches(
                LocalDate.now(), LocalDate.now().plusDays(warningDays));
        for (MedicineBatch batch : expiringSoonBatches) {
            long daysUntilExpiry = LocalDate.now().until(batch.getExpiryDate()).getDays();
            writer.printf("%s,%s,%s,%d,%s,%d%n",
                    escapeCSV(batch.getMedicine().getCode()),
                    escapeCSV(batch.getMedicine().getName()),
                    escapeCSV(batch.getBatchNumber()),
                    batch.getRemainingQuantity(),
                    batch.getExpiryDate().format(DateTimeFormatter.ISO_DATE),
                    daysUntilExpiry
            );
        }

        writer.flush();
        return out.toByteArray();
    }

    private String escapeCSV(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
