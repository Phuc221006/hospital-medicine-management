package com.hospital.medicine.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookAppointmentRequest {
    private String doctorName;
    private String department;
    // expected format: YYYY-MM-DD
    private String date;
    // expected format: HH:mm
    private String time;
    private String notes;
}
