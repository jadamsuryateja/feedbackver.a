import { useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Config, TheorySubject, LabSubject } from '../types';

interface ValidationRules {
  titleRegex: RegExp;
  titleFormat: string;
  titleExample: string;
  allowedBranches: string[];
  allowedYears: string[];
  allowedSemesters: string[];
  sectionFormat: string;
}

interface ConfigFormProps {
  role: 'admin' | 'coordinator' | 'bsh';
  branch?: string;
  initialData: Config | null;
  onSave: () => Promise<void>;
  validationRules?: ValidationRules;
}

const BRANCH_OPTIONS = [
  'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AI', 
  'AIML', 'DS', 'CS', 'IT', 'MBA', 'MCA'
];

const ConfigForm = ({ branch = '', onSave, role, initialData, validationRules }: ConfigFormProps) => {
  // Update validation functions to use validationRules if provided
  const validateTitle = (title: string): boolean => {
    if (!validationRules) return title.length > 0;
    return validationRules.titleRegex.test(title);
  };

  const validateSection = (section: string): boolean => {
    if (!validationRules) return /^[A-Z]$/.test(section);
    return new RegExp(`^${validationRules.sectionFormat}$`).test(section);
  };

  const [formData, setFormData] = useState<Config>({
    title: initialData?.title?.toUpperCase() || '',
    branch: branch || initialData?.branch || '', // Add fallback
    academicYear: '',
    year: 1,
    semester: 1,
    section: 'A',
    theorySubjects: [{ teacherName: '', subjectName: '' }],
    labSubjects: [{ labTeacherName: '', labName: '' }],
    ...initialData
  });
  const [error, setError] = useState<string | null>(null);
  const [loading] = useState(false);

  const validateAcademicYear = (value: string) => {
    const pattern = /^\d{4}-\d{4}$/;
    if (!pattern.test(value)) return false;
    
    const [start, end] = value.split('-').map(Number);
    if (isNaN(start) || isNaN(end)) return false;
    
    // Check if years are consecutive and both are valid years
    return end === start + 1 && start >= 2000 && end <= 2100;
  };

  const addTheorySubject = () => {
    setFormData({
      ...formData,
      theorySubjects: [...formData.theorySubjects, { teacherName: '', subjectName: '' }]
    });
  };

  const removeTheorySubject = (index: number) => {
    setFormData({
      ...formData,
      theorySubjects: formData.theorySubjects.filter((_, i) => i !== index)
    });
  };

  const updateTheorySubject = (index: number, field: keyof TheorySubject, value: string) => {
    const updated = [...formData.theorySubjects];
    updated[index][field] = value;
    setFormData({ ...formData, theorySubjects: updated });
  };

  const addLabSubject = () => {
    setFormData({
      ...formData,
      labSubjects: [...formData.labSubjects, { labTeacherName: '', labName: '' }]
    });
  };

  const removeLabSubject = (index: number) => {
    setFormData({
      ...formData,
      labSubjects: formData.labSubjects.filter((_, i) => i !== index)
    });
  };

  const updateLabSubject = (index: number, field: keyof LabSubject, value: string) => {
    const updated = [...formData.labSubjects];
    updated[index][field] = value;
    setFormData({ ...formData, labSubjects: updated });
  };

  const handleAcademicYearChange = (value: string) => {
    // Allow any input but show error if format is wrong
    setFormData({ ...formData, academicYear: value });
    
    // Only show error if there's a value and it's invalid
    if (value && !validateAcademicYear(value)) {
      setError('Academic year must be in format YYYY-YYYY with consecutive years');
    } else {
      setError(null);
    }
  };

  // Remove title validation checks
  const handleTitleChange = (value: string) => {
    const uppercaseValue = value.toUpperCase();
    setFormData({ ...formData, title: uppercaseValue });
  };

  // Update the handleSectionChange function
  const handleSectionChange = (value: string) => {
    const uppercaseValue = value.toUpperCase();
    // Update both section and title
    const currentTitle = formData.title.split('-');
    const isBSH = currentTitle.includes('BSH');
    
    let newTitle;
    if (isBSH && currentTitle.length === 5) {
      // Format: BRANCH-BSH-SECTION-SEMESTER-YEAR
      newTitle = `${currentTitle[0]}-BSH-${uppercaseValue}-${currentTitle[3]}-${currentTitle[4]}`;
    } else if (!isBSH && currentTitle.length === 4) {
      // Format: BRANCH-SECTION-SEMESTER-YEAR
      newTitle = `${currentTitle[0]}-${uppercaseValue}-${currentTitle[2]}-${currentTitle[3]}`;
    } else {
      newTitle = formData.title;
    }

    setFormData(prev => ({
      ...prev,
      section: uppercaseValue,
      title: newTitle
    }));
    
    if (uppercaseValue && !validateSection(uppercaseValue)) {
      setError('Section must be a single uppercase letter (A-Z)');
    } else {
      setError(null);
    }
  };

  // Add this function to handle branch selection for BSH

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submissionData = {
        ...formData,
        branch: role === 'bsh' && !formData.branch.endsWith('-BSH') 
          ? `${formData.branch}-BSH` 
          : formData.branch
      };

      if (initialData?._id) {
        await api.config.update(initialData._id, submissionData);
      } else {
        await api.config.create(submissionData);
      }
      
      await onSave();
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(err.message || 'Failed to save configuration');
    }
  };


  const getTitleErrorMessage = () => {
    if (!validationRules) return 'Title is required';
    return `Invalid title format. Must be: ${validationRules.titleFormat} (e.g., ${validationRules.titleExample})`;
  };

  // Update branch options based on validationRules
  const branchOptions = validationRules?.allowedBranches || BRANCH_OPTIONS;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title of the Form *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={`w-full px-4 py-2 bg-slate-700 border ${
                formData.title && !validateTitle(formData.title)
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-600 focus:ring-blue-500'
              } text-white rounded-lg focus:ring-2 focus:border-transparent outline-none placeholder-slate-400 uppercase`}
              placeholder={role === 'bsh' ? "e.g., CSE-BSH-A-1-1" : "e.g., CSE-D-4-1"}
              required
            />
            {formData.title && !validateTitle(formData.title) && (
              <p className="mt-1 text-sm text-red-400">
                {getTitleErrorMessage()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Year *
            </label>
            <select
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              <option value={1}>1st Year</option>
              <option value={2}>2nd Year</option>
              <option value={3}>3rd Year</option>
              <option value={4}>4th Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Academic Year * (YYYY-YYYY)
            </label>
            <input
              type="text"
              value={formData.academicYear}
              onChange={(e) => handleAcademicYearChange(e.target.value)}
              placeholder="2024-2025"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Semester *
            </label>
            <select
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Branch *
            </label>
            <select
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              <option value="">Select Branch</option>
              {branchOptions.map((branchOption) => (
                <option key={branchOption} value={branchOption}>
                  {branchOption}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Section *
            </label>
            <input
              type="text"
              value={formData.section}
              onChange={(e) => handleSectionChange(e.target.value)}
              className={`w-full px-4 py-2 bg-slate-700 border ${
                formData.section && !validateSection(formData.section)
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-600 focus:ring-blue-500'
              } text-white rounded-lg focus:ring-2 focus:border-transparent outline-none placeholder-slate-400 uppercase`}
              placeholder="e.g., A"
              maxLength={1}
              pattern="[A-Za-z]"
              required
            />
            {formData.section && !validateSection(formData.section) && (
              <p className="mt-1 text-sm text-red-400">
                Section must be a single uppercase letter (A-Z)
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Theory Subjects</h2>
          <button
            type="button"
            onClick={addTheorySubject}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white text-sm sm:text-base rounded-lg hover:bg-green-700 transition w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Add Theory Subject</span>
            <span className="sm:hidden">Add Theory</span>
          </button>
        </div>

        <div className="space-y-4">
          {formData.theorySubjects.map((subject, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Teacher {index + 1} Name
                </label>
                <input
                  type="text"
                  value={subject.teacherName}
                  onChange={(e) => updateTheorySubject(index, 'teacherName', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400"
                  placeholder="Enter teacher name"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Subject {index + 1} Name
                  </label>
                  <input
                    type="text"
                    value={subject.subjectName}
                    onChange={(e) => updateTheorySubject(index, 'subjectName', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400"
                    placeholder="Enter subject name"
                  />
                </div>
                {formData.theorySubjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTheorySubject(index)}
                    className="mt-7 p-1.5 sm:p-2 text-red-400 hover:bg-slate-600/50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Lab Subjects</h2>
          <button
            type="button"
            onClick={addLabSubject}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white text-sm sm:text-base rounded-lg hover:bg-green-700 transition w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Add Lab Subject</span>
            <span className="sm:hidden">Add Lab</span>
          </button>
        </div>

        <div className="space-y-4">
          {formData.labSubjects.map((subject, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Lab Teacher {index + 1} Name
                </label>
                <input
                  type="text"
                  value={subject.labTeacherName}
                  onChange={(e) => updateLabSubject(index, 'labTeacherName', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400"
                  placeholder="Enter lab teacher name"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Lab {index + 1} Name
                  </label>
                  <input
                    type="text"
                    value={subject.labName}
                    onChange={(e) => updateLabSubject(index, 'labName', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400"
                    placeholder="Enter lab name"
                  />
                </div>
                {formData.labSubjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLabSubject(index)}
                    className="mt-7 p-1.5 sm:p-2 text-red-400 hover:bg-slate-600/50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Saving...</span>
            </>
          ) : (
            'Save Configuration'
          )}
        </button>
      </div>
    </form>
  );
};

export default ConfigForm;
