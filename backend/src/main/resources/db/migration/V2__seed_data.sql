-- Insert default admin user (password: admin123)
INSERT INTO users (email, password, full_name, phone, role, provider, enabled)
VALUES ('admin@hospital.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'System Administrator', '0123456789', 'ADMIN', 'LOCAL', TRUE);

-- Insert medicine categories
INSERT INTO medicine_categories (name, description) VALUES
('Kháng sinh', 'Thuốc kháng sinh điều trị nhiễm khuẩn'),
('Giảm đau', 'Thuốc giảm đau, hạ sốt'),
('Vitamin', 'Vitamin và khoáng chất bổ sung'),
('Tim mạch', 'Thuốc điều trị bệnh tim mạch'),
('Tiêu hóa', 'Thuốc điều trị bệnh tiêu hóa'),
('Hô hấp', 'Thuốc điều trị bệnh hô hấp'),
('Thần kinh', 'Thuốc điều trị bệnh thần kinh'),
('Da liễu', 'Thuốc điều trị bệnh da liễu');

-- Insert sample suppliers
INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES
('Công ty Dược phẩm Hậu Giang', 'Nguyễn Văn A', '0283123456', 'contact@dhg.com.vn', '288 Bis Nguyễn Văn Cừ, Quận 1, TP.HCM'),
('Công ty Dược Sài Gòn', 'Trần Thị B', '0283654321', 'info@sapharco.com', '18-20 Nguyễn Trường Tộ, Quận 4, TP.HCM'),
('Traphaco', 'Lê Văn C', '0243987654', 'sales@traphaco.com.vn', '75 Yên Ninh, Ba Đình, Hà Nội'),
('Pymepharco', 'Phạm Thị D', '0573456789', 'pymepharco@gmail.com', '166-170 Nguyễn Huệ, TP. Tuy Hòa, Phú Yên');

-- Insert sample medicines
INSERT INTO medicines (code, name, generic_name, category_id, supplier_id, unit, price, description, requires_prescription) VALUES
('MED001', 'Amoxicillin 500mg', 'Amoxicillin', 1, 1, 'Viên', 2500, 'Kháng sinh phổ rộng điều trị nhiễm khuẩn', TRUE),
('MED002', 'Paracetamol 500mg', 'Paracetamol', 2, 2, 'Viên', 1000, 'Thuốc giảm đau, hạ sốt', FALSE),
('MED003', 'Vitamin C 1000mg', 'Ascorbic Acid', 3, 3, 'Viên', 3000, 'Bổ sung vitamin C', FALSE),
('MED004', 'Omeprazole 20mg', 'Omeprazole', 5, 1, 'Viên', 4500, 'Thuốc điều trị loét dạ dày', TRUE),
('MED005', 'Cetirizine 10mg', 'Cetirizine', 6, 2, 'Viên', 2000, 'Thuốc chống dị ứng', FALSE),
('MED006', 'Metformin 500mg', 'Metformin', 4, 4, 'Viên', 1500, 'Thuốc điều trị tiểu đường type 2', TRUE),
('MED007', 'Losartan 50mg', 'Losartan', 4, 3, 'Viên', 5000, 'Thuốc điều trị tăng huyết áp', TRUE),
('MED008', 'Ibuprofen 400mg', 'Ibuprofen', 2, 1, 'Viên', 2200, 'Thuốc giảm đau, kháng viêm', FALSE);

-- Insert sample batches
INSERT INTO medicine_batches (medicine_id, batch_number, quantity, remaining_quantity, manufacturing_date, expiry_date, import_price, import_date) VALUES
(1, 'LOT-AMX-001', 1000, 850, '2024-01-15', '2026-01-15', 2000, '2024-02-01'),
(1, 'LOT-AMX-002', 500, 500, '2024-06-01', '2026-06-01', 2100, '2024-06-15'),
(2, 'LOT-PRC-001', 2000, 1500, '2024-03-01', '2026-03-01', 800, '2024-03-15'),
(3, 'LOT-VTC-001', 1500, 1200, '2024-04-01', '2025-04-01', 2500, '2024-04-20'),
(4, 'LOT-OMP-001', 800, 600, '2024-02-01', '2025-08-01', 3800, '2024-02-20'),
(5, 'LOT-CET-001', 1000, 900, '2024-05-01', '2026-05-01', 1600, '2024-05-10'),
(6, 'LOT-MET-001', 1200, 1000, '2024-01-20', '2025-07-20', 1200, '2024-02-01'),
(7, 'LOT-LOS-001', 600, 450, '2024-03-10', '2025-09-10', 4200, '2024-03-25'),
(8, 'LOT-IBU-001', 1500, 1300, '2024-04-15', '2026-04-15', 1800, '2024-05-01');

-- Insert global alert settings
INSERT INTO alert_settings (min_quantity_threshold, expiry_warning_days, is_global, active, created_by)
VALUES (50, 30, TRUE, TRUE, 1);
