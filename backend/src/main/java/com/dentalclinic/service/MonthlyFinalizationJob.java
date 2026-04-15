package com.dentalclinic.service;

import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.dentalclinic.model.MonthlyRevenue;

/**
 * Scheduled job that finalizes the previous calendar month at midnight on the
 * 1st of every month.
 *
 * <p>This is the automatic path for month-end finalization. If the server is
 * offline when the job fires, the manual recovery path is:
 * {@code POST /api/revenue/finalize/{year}/{month}}.
 *
 * <p>Requires {@code @EnableScheduling} on the main application class, which
 * was added in this session.
 *
 * <p>The underlying {@link RevenueService#finalizeMonth} call is idempotent —
 * if finalization has already been done (manually or by a previous job run)
 * the job is a no-op.
 */
@Component
public class MonthlyFinalizationJob {

    private static final Logger log = LoggerFactory.getLogger(MonthlyFinalizationJob.class);

    @Autowired
    private RevenueService revenueService;

    /**
     * Runs at midnight (00:00:00) on the 1st of every month.
     *
     * <p>Cron expression: {@code "0 0 0 1 * *"} — second, minute, hour, day-of-month, month, day-of-week.
     */
    @Scheduled(cron = "0 0 0 1 * *")
    public void finalizeLastMonth() {
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        int year  = lastMonth.getYear();
        int month = lastMonth.getMonthValue();

        log.info("[MonthlyFinalizationJob] Bắt đầu chốt sổ tháng {}/{}", month, year);

        try {
            MonthlyRevenue result = revenueService.finalizeMonth(year, month);

            log.info("[MonthlyFinalizationJob] Chốt sổ thành công — "
                    + "Tháng {}/{}: doanh thu={}, TNCN={}, số lịch hẹn={}",
                    month, year,
                    result.getTotalRevenue(),
                    result.getTncnAmount(),
                    result.getAppointmentCount());

        } catch (Exception e) {
            log.error("[MonthlyFinalizationJob] Lỗi khi chốt sổ tháng {}/{}: {}",
                    month, year, e.getMessage(), e);
        }
    }
}
