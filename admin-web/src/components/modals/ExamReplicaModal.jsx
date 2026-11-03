import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function ExamReplicaModal({ open, exam, onClose, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    durationMinutes: '',
    totalMarks: '',
    marksPerQuestion: '',
    negativeMarking: false,
    negativeMarks: '',
    instructions: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (exam && open) {
      const startDate = exam.startTime ? new Date(exam.startTime).toISOString().slice(0, 16) : '';
      const endDate = exam.endTime ? new Date(exam.endTime).toISOString().slice(0, 16) : '';
      
      setFormData({
        name: `${exam.name} (Copy)`,
        startTime: startDate,
        endTime: endDate,
        durationMinutes: exam.durationMinutes || '',
        totalMarks: exam.totalMarks || '',
        marksPerQuestion: exam.marksPerQuestion || '',
        negativeMarking: exam.negativeMarking || false,
        negativeMarks: exam.negativeMarks || '',
        instructions: exam.instructions || '',
      });
      setErrors({});
    }
  }, [exam, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Exam name is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (formData.startTime && formData.endTime && new Date(formData.endTime) <= new Date(formData.startTime)) {
      newErrors.endTime = 'End time must be after start time';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      name: formData.name,
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
    };

    if (formData.durationMinutes) payload.durationMinutes = Number(formData.durationMinutes);
    if (formData.totalMarks) payload.totalMarks = Number(formData.totalMarks);
    if (formData.marksPerQuestion) payload.marksPerQuestion = Number(formData.marksPerQuestion);
    if (formData.negativeMarking !== exam?.negativeMarking) payload.negativeMarking = formData.negativeMarking;
    if (formData.negativeMarks) payload.negativeMarks = Number(formData.negativeMarks);
    if (formData.instructions !== exam?.instructions) payload.instructions = formData.instructions;

    await onSubmit(payload);
  };

  return (
    <Modal open={open} onClose={onClose} title="Duplicate Exam" size="lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Exam Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter new exam name"
            className={`w-full px-3 py-2 rounded-lg border ${errors.name ? 'border-error' : 'border-border'} bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand`}
          />
          {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Start Date & Time *</label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border ${errors.startTime ? 'border-error' : 'border-border'} bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand`}
            />
            {errors.startTime && <p className="text-xs text-error mt-1">{errors.startTime}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">End Date & Time *</label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border ${errors.endTime ? 'border-error' : 'border-border'} bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand`}
            />
            {errors.endTime && <p className="text-xs text-error mt-1">{errors.endTime}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Duration (minutes)</label>
            <input
              type="number"
              name="durationMinutes"
              value={formData.durationMinutes}
              onChange={handleChange}
              min="1"
              max="600"
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Total Marks</label>
            <input
              type="number"
              name="totalMarks"
              value={formData.totalMarks}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Marks Per Question</label>
            <input
              type="number"
              name="marksPerQuestion"
              value={formData.marksPerQuestion}
              onChange={handleChange}
              min="0.5"
              step="0.5"
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Negative Marks</label>
            <input
              type="number"
              name="negativeMarks"
              value={formData.negativeMarks}
              onChange={handleChange}
              min="0"
              disabled={!formData.negativeMarking}
              className="w-full px-3 py-2 rounded-lg border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-surface disabled:text-text-muted"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="negativeMarking"
            name="negativeMarking"
            checked={formData.negativeMarking}
            onChange={handleChange}
            className="w-4 h-4 rounded border-border cursor-pointer"
          />
          <label htmlFor="negativeMarking" className="text-sm font-medium text-text-primary cursor-pointer">
            Enable Negative Marking
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Instructions</label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            placeholder="Enter exam instructions"
            rows="3"
            className="w-full px-3 py-2 rounded-lg border border-border bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand resize-none"
          />
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Create Duplicate
          </Button>
        </div>
      </div>
    </Modal>
  );
}
