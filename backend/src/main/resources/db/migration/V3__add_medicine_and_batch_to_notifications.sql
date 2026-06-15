-- Add medicine_id and batch_id to notifications for linking to medicines and batches
ALTER TABLE notifications
  ADD COLUMN medicine_id BIGINT NULL,
  ADD COLUMN batch_id BIGINT NULL;

-- Create indexes to improve query performance
CREATE INDEX idx_notifications_medicine_id ON notifications(medicine_id);
CREATE INDEX idx_notifications_batch_id ON notifications(batch_id);

-- Add foreign key constraints (set NULL when referenced record is deleted)
ALTER TABLE notifications
  ADD CONSTRAINT fk_notifications_medicine
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_notifications_batch
    FOREIGN KEY (batch_id) REFERENCES medicine_batches(id) ON DELETE SET NULL;
