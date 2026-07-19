import React, { useState } from "react";
import { useResume } from "../../contexts/ResumeContext";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { RESUME_LIMITS, isValidMonth } from "../../utils/resumeValidation";
import { formatMonthYear } from "../../utils/resumeData";

const emptyExperience = () => ({
  company: "",
  position: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
});

export default function ExperienceForm() {
  const { resumeData, addExperience, updateExperience, deleteExperience } =
    useResume();
  const [draft, setDraft] = useState(emptyExperience);
  const [editingIndex, setEditingIndex] = useState(null);
  const [errors, setErrors] = useState({});

  const change = (event) => {
    const { name, value, type, checked } = event.target;
    setDraft((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "current" && checked ? { endDate: "" } : {}),
    }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };
  const reset = () => {
    setDraft(emptyExperience());
    setEditingIndex(null);
    setErrors({});
  };
  const edit = (index) => {
    setDraft({ ...emptyExperience(), ...resumeData.experience[index] });
    setEditingIndex(index);
    setErrors({});
  };
  const save = () => {
    const nextErrors = {};
    if (!draft.company.trim()) nextErrors.company = "Company is required.";
    if (!draft.position.trim()) nextErrors.position = "Position is required.";
    if (!draft.startDate) nextErrors.startDate = "Start date is required.";
    else if (!isValidMonth(draft.startDate))
      nextErrors.startDate = "Enter a valid start month.";
    if (draft.endDate && !isValidMonth(draft.endDate))
      nextErrors.endDate = "Enter a valid end month.";
    else if (
      !draft.current &&
      draft.startDate &&
      draft.endDate &&
      draft.endDate < draft.startDate
    )
      nextErrors.endDate = "End date cannot be before start date.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const payload = {
      ...draft,
      id:
        editingIndex === null
          ? `experience-${Date.now()}`
          : resumeData.experience[editingIndex].id,
    };
    if (editingIndex === null) addExperience(payload);
    else updateExperience(editingIndex, payload);
    reset();
  };

  const fieldError = (field) =>
    errors[field] && (
      <p
        id={`experience-${field}-error`}
        className="mt-1 text-sm text-red-600"
        role="alert"
      >
        {errors[field]}
      </p>
    );
  return (
    <div className="card p-5 sm:p-6">
      <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
        Professional Experience
      </h2>
      {resumeData.experience.length > 0 && (
        <div className="mb-6 space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Added Experience
          </h3>
          {resumeData.experience.map((item, index) => (
            <div
              key={item.id || index}
              className="rounded-md bg-gray-50 p-4 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {item.position}
                  </div>
                  <div className="text-blue-600 dark:text-blue-400">
                    {item.company}
                  </div>
                  <div className="text-sm text-gray-500">
                  {formatMonthYear(item.startDate)} - {item.current ? "Present" : formatMonthYear(item.endDate)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => edit(index)}
                    className="p-2 text-gray-500 hover:text-blue-600"
                    aria-label={`Edit ${item.position || "experience"}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteExperience(index)}
                    className="p-2 text-gray-500 hover:text-red-600"
                    aria-label={`Delete ${item.position || "experience"}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="experience-company" className="form-label">
              Company *
            </label>
            <input
              id="experience-company"
              name="company"
              value={draft.company}
              onChange={change}
              className="form-input"
              maxLength={RESUME_LIMITS.short}
              aria-invalid={Boolean(errors.company)}
              aria-describedby={
                errors.company ? "experience-company-error" : undefined
              }
            />
            {fieldError("company")}
          </div>
          <div>
            <label htmlFor="experience-position" className="form-label">
              Position *
            </label>
            <input
              id="experience-position"
              name="position"
              value={draft.position}
              onChange={change}
              className="form-input"
              maxLength={RESUME_LIMITS.short}
              aria-invalid={Boolean(errors.position)}
              aria-describedby={
                errors.position ? "experience-position-error" : undefined
              }
            />
            {fieldError("position")}
          </div>
        </div>
        <div>
          <label htmlFor="experience-location" className="form-label">
            Location
          </label>
          <input
            id="experience-location"
            name="location"
            value={draft.location}
            onChange={change}
            className="form-input"
            maxLength={RESUME_LIMITS.short}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="experience-start" className="form-label">
              Start Date *
            </label>
            <input
              id="experience-start"
              type="month"
              name="startDate"
              value={draft.startDate}
              onChange={change}
              className="form-input"
              aria-invalid={Boolean(errors.startDate)}
            />
            {fieldError("startDate")}
          </div>
          <div>
            <label htmlFor="experience-end" className="form-label">
              End Date
            </label>
            <input
              id="experience-end"
              type="month"
              name="endDate"
              value={draft.endDate}
              onChange={change}
              disabled={draft.current}
              className="form-input"
              aria-invalid={Boolean(errors.endDate)}
            />
            {fieldError("endDate")}
          </div>
        </div>
        <div className="flex items-center">
          <input
            id="experience-current"
            type="checkbox"
            name="current"
            checked={draft.current}
            onChange={change}
            className="h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          <label
            htmlFor="experience-current"
            className="ml-2 text-sm text-gray-700 dark:text-gray-300"
          >
            I currently work here
          </label>
        </div>
        <div>
          <label htmlFor="experience-description" className="form-label">
            Description
          </label>
          <textarea
            id="experience-description"
            name="description"
            rows="4"
            value={draft.description}
            onChange={change}
            className="form-input"
            maxLength={RESUME_LIMITS.description}
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={save}
            className="btn-secondary flex flex-1 items-center justify-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            {editingIndex === null ? "Add Experience" : "Save Experience"}
          </button>
          {editingIndex !== null && (
            <button
              type="button"
              onClick={reset}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
