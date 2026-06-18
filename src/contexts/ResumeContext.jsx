import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { DEFAULT_TEMPLATE_CATEGORY } from '../data/templateCategories';
import { DEFAULT_SECTION_TITLES, buildUnifiedSections, normalizeCustomSection } from '../utils/resumeSections';

// Initial resume data structure
const initialResumeData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    summary: '',
    photo: null
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  achievements: [],
  customSections: [],
  languages: []
};

// Initial state
const initialState = {
  resumeData: initialResumeData,
  selectedTemplate: '12',
  templateCategory: DEFAULT_TEMPLATE_CATEGORY,
  customization: {
    fontFamily: 'Inter',
    colorTheme: 'blue',
    sectionOrder: ['personalInfo', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'achievements', 'customSections'],
    sectionTitles: {},
    sectionVisibility: {}
  },
  isDarkMode: true
};

// Action types
const ACTIONS = {
  UPDATE_PERSONAL_INFO: 'UPDATE_PERSONAL_INFO',
  ADD_EXPERIENCE: 'ADD_EXPERIENCE',
  UPDATE_EXPERIENCE: 'UPDATE_EXPERIENCE',
  DELETE_EXPERIENCE: 'DELETE_EXPERIENCE',
  ADD_EDUCATION: 'ADD_EDUCATION',
  UPDATE_EDUCATION: 'UPDATE_EDUCATION',
  DELETE_EDUCATION: 'DELETE_EDUCATION',
  UPDATE_SKILLS: 'UPDATE_SKILLS',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  ADD_CERTIFICATION: 'ADD_CERTIFICATION',
  UPDATE_CERTIFICATION: 'UPDATE_CERTIFICATION',
  DELETE_CERTIFICATION: 'DELETE_CERTIFICATION',
  ADD_ACHIEVEMENT: 'ADD_ACHIEVEMENT',
  UPDATE_ACHIEVEMENT: 'UPDATE_ACHIEVEMENT',
  DELETE_ACHIEVEMENT: 'DELETE_ACHIEVEMENT',
  ADD_CUSTOM_SECTION: 'ADD_CUSTOM_SECTION',
  UPDATE_CUSTOM_SECTION: 'UPDATE_CUSTOM_SECTION',
  DELETE_CUSTOM_SECTION: 'DELETE_CUSTOM_SECTION',
  DUPLICATE_CUSTOM_SECTION: 'DUPLICATE_CUSTOM_SECTION',
  MOVE_CUSTOM_SECTION: 'MOVE_CUSTOM_SECTION',
  RENAME_SECTION: 'RENAME_SECTION',
  TOGGLE_SECTION_VISIBILITY: 'TOGGLE_SECTION_VISIBILITY',
  SET_TEMPLATE: 'SET_TEMPLATE',
  SET_TEMPLATE_CATEGORY: 'SET_TEMPLATE_CATEGORY',
  UPDATE_CUSTOMIZATION: 'UPDATE_CUSTOMIZATION',
  REORDER_SECTIONS: 'REORDER_SECTIONS',
  TOGGLE_DARK_MODE: 'TOGGLE_DARK_MODE',
  RESET_RESUME: 'RESET_RESUME',
  LOAD_RESUME: 'LOAD_RESUME'
};

// Reducer function
function resumeReducer(state, action) {
  switch (action.type) {
    case ACTIONS.UPDATE_PERSONAL_INFO:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          personalInfo: { ...state.resumeData.personalInfo, ...action.payload }
        }
      };

    case ACTIONS.ADD_EXPERIENCE:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          experience: [...state.resumeData.experience, action.payload]
        }
      };

    case ACTIONS.UPDATE_EXPERIENCE:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          experience: state.resumeData.experience.map((exp, index) =>
            index === action.payload.index ? { ...exp, ...action.payload.data } : exp
          )
        }
      };

    case ACTIONS.DELETE_EXPERIENCE:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          experience: state.resumeData.experience.filter((_, index) => index !== action.payload)
        }
      };

    case ACTIONS.ADD_EDUCATION:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          education: [...state.resumeData.education, action.payload]
        }
      };

    case ACTIONS.UPDATE_EDUCATION:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          education: state.resumeData.education.map((edu, index) =>
            index === action.payload.index ? { ...edu, ...action.payload.data } : edu
          )
        }
      };

    case ACTIONS.DELETE_EDUCATION:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          education: state.resumeData.education.filter((_, index) => index !== action.payload)
        }
      };

    case ACTIONS.UPDATE_SKILLS:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          skills: action.payload
        }
      };

    case ACTIONS.ADD_PROJECT:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          projects: [...state.resumeData.projects, action.payload]
        }
      };

    case ACTIONS.UPDATE_PROJECT:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          projects: state.resumeData.projects.map((project, index) =>
            index === action.payload.index ? { ...project, ...action.payload.data } : project
          )
        }
      };

    case ACTIONS.DELETE_PROJECT:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          projects: state.resumeData.projects.filter((_, index) => index !== action.payload)
        }
      };
      
    case ACTIONS.ADD_CERTIFICATION:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          certifications: [...state.resumeData.certifications, action.payload]
        }
      };

    case ACTIONS.UPDATE_CERTIFICATION:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          certifications: state.resumeData.certifications.map((cert, index) =>
            index === action.payload.index ? { ...cert, ...action.payload.data } : cert
          )
        }
      };

    case ACTIONS.DELETE_CERTIFICATION:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          certifications: state.resumeData.certifications.filter((_, index) => index !== action.payload)
        }
      };
      
    case ACTIONS.ADD_ACHIEVEMENT:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          achievements: [...state.resumeData.achievements, action.payload]
        }
      };

    case ACTIONS.UPDATE_ACHIEVEMENT:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          achievements: state.resumeData.achievements.map((achievement, index) =>
            index === action.payload.index ? { ...achievement, ...action.payload.data } : achievement
          )
        }
      };

    case ACTIONS.DELETE_ACHIEVEMENT:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          achievements: state.resumeData.achievements.filter((_, index) => index !== action.payload)
        }
      };

    case ACTIONS.ADD_CUSTOM_SECTION:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          customSections: [
            ...(state.resumeData.customSections || []),
            normalizeCustomSection(action.payload, (state.resumeData.customSections || []).length)
          ]
        }
      };

    case ACTIONS.UPDATE_CUSTOM_SECTION:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          customSections: (state.resumeData.customSections || []).map((section, index) =>
            index === action.payload.index ? { ...section, ...action.payload.data } : section
          )
        }
      };

    case ACTIONS.DELETE_CUSTOM_SECTION:
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          customSections: (state.resumeData.customSections || []).filter((_, index) => index !== action.payload)
        }
      };

    case ACTIONS.DUPLICATE_CUSTOM_SECTION: {
      const sections = state.resumeData.customSections || [];
      const source = sections[action.payload];
      if (!source) return state;
      const duplicate = normalizeCustomSection({
        ...source,
        id: `${source.id || 'custom'}-copy-${Date.now()}`,
        title: `${source.title || 'Custom Section'} Copy`,
        order: action.payload + 1
      });
      const nextSections = [...sections];
      nextSections.splice(action.payload + 1, 0, duplicate);
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          customSections: nextSections.map((section, index) => ({ ...section, order: index }))
        }
      };
    }

    case ACTIONS.MOVE_CUSTOM_SECTION: {
      const sections = [...(state.resumeData.customSections || [])];
      const { index, direction } = action.payload;
      const target = index + direction;
      if (index < 0 || target < 0 || index >= sections.length || target >= sections.length) return state;
      [sections[index], sections[target]] = [sections[target], sections[index]];
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          customSections: sections.map((section, order) => ({ ...section, order }))
        }
      };
    }

    case ACTIONS.RENAME_SECTION:
      return {
        ...state,
        customization: {
          ...state.customization,
          sectionTitles: {
            ...(state.customization.sectionTitles || {}),
            [action.payload.type]: action.payload.title
          }
        }
      };

    case ACTIONS.TOGGLE_SECTION_VISIBILITY: {
      const isVisible = state.customization.sectionVisibility?.[action.payload] !== false;
      return {
        ...state,
        customization: {
          ...state.customization,
          sectionVisibility: {
            ...(state.customization.sectionVisibility || {}),
            [action.payload]: !isVisible
          }
        }
      };
    }

    case ACTIONS.SET_TEMPLATE:
      return {
        ...state,
        selectedTemplate: action.payload
      };

    case ACTIONS.SET_TEMPLATE_CATEGORY:
      return {
        ...state,
        templateCategory: action.payload
      };

    case ACTIONS.UPDATE_CUSTOMIZATION:
      return {
        ...state,
        customization: { ...state.customization, ...action.payload }
      };

    case ACTIONS.REORDER_SECTIONS:
      return {
        ...state,
        customization: {
          ...state.customization,
          sectionOrder: action.payload
        }
      };

    case ACTIONS.TOGGLE_DARK_MODE:
      return {
        ...state,
        isDarkMode: !state.isDarkMode
      };

    case ACTIONS.RESET_RESUME:
      return {
        ...state,
        resumeData: initialResumeData
      };

    case ACTIONS.LOAD_RESUME:
      return {
        ...state,
        ...action.payload,
        resumeData: {
          ...initialResumeData,
          ...(action.payload.resumeData || {}),
          customSections: (action.payload.resumeData?.customSections || []).map(normalizeCustomSection)
        },
        customization: {
          ...initialState.customization,
          ...(action.payload.customization || {}),
          sectionTitles: action.payload.customization?.sectionTitles || {}
        }
      };

    default:
      return state;
  }
}

// Create context
const ResumeContext = createContext();

// Context provider component
export function ResumeProvider({ children }) {
  const [state, dispatch] = useReducer(resumeReducer, initialState);

  // Load dark mode preference and saved resume data from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      dispatch({ type: ACTIONS.TOGGLE_DARK_MODE });
    }

    const savedResume = localStorage.getItem('savedResume');
    if (savedResume) {
      try {
        const parsed = JSON.parse(savedResume);
        dispatch({ type: ACTIONS.LOAD_RESUME, payload: parsed });
      } catch (err) {
        console.error('Failed to parse saved resume from local storage', err);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('darkMode', state.isDarkMode);
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Cache the entire state so the user doesn't lose it on refresh
    localStorage.setItem('savedResume', JSON.stringify(state));
  }, [state]);

  // Action creators
  const actions = {
    updatePersonalInfo: (data) => dispatch({ type: ACTIONS.UPDATE_PERSONAL_INFO, payload: data }),
    addExperience: (data) => dispatch({ type: ACTIONS.ADD_EXPERIENCE, payload: data }),
    updateExperience: (index, data) => dispatch({ type: ACTIONS.UPDATE_EXPERIENCE, payload: { index, data } }),
    deleteExperience: (index) => dispatch({ type: ACTIONS.DELETE_EXPERIENCE, payload: index }),
    addEducation: (data) => dispatch({ type: ACTIONS.ADD_EDUCATION, payload: data }),
    updateEducation: (index, data) => dispatch({ type: ACTIONS.UPDATE_EDUCATION, payload: { index, data } }),
    deleteEducation: (index) => dispatch({ type: ACTIONS.DELETE_EDUCATION, payload: index }),
    updateSkills: (skills) => dispatch({ type: ACTIONS.UPDATE_SKILLS, payload: skills }),
    addProject: (data) => dispatch({ type: ACTIONS.ADD_PROJECT, payload: data }),
    updateProject: (index, data) => dispatch({ type: ACTIONS.UPDATE_PROJECT, payload: { index, data } }),
    deleteProject: (index) => dispatch({ type: ACTIONS.DELETE_PROJECT, payload: index }),
    addCertification: (data) => dispatch({ type: ACTIONS.ADD_CERTIFICATION, payload: data }),
    updateCertification: (index, data) => dispatch({ type: ACTIONS.UPDATE_CERTIFICATION, payload: { index, data } }),
    deleteCertification: (index) => dispatch({ type: ACTIONS.DELETE_CERTIFICATION, payload: index }),
    addAchievement: (data) => dispatch({ type: ACTIONS.ADD_ACHIEVEMENT, payload: data }),
    updateAchievement: (index, data) => dispatch({ type: ACTIONS.UPDATE_ACHIEVEMENT, payload: { index, data } }),
    deleteAchievement: (index) => dispatch({ type: ACTIONS.DELETE_ACHIEVEMENT, payload: index }),
    addCustomSection: (data) => dispatch({ type: ACTIONS.ADD_CUSTOM_SECTION, payload: data }),
    updateCustomSection: (index, data) => dispatch({ type: ACTIONS.UPDATE_CUSTOM_SECTION, payload: { index, data } }),
    deleteCustomSection: (index) => dispatch({ type: ACTIONS.DELETE_CUSTOM_SECTION, payload: index }),
    duplicateCustomSection: (index) => dispatch({ type: ACTIONS.DUPLICATE_CUSTOM_SECTION, payload: index }),
    moveCustomSection: (index, direction) => dispatch({ type: ACTIONS.MOVE_CUSTOM_SECTION, payload: { index, direction } }),
    renameSection: (type, title) => dispatch({ type: ACTIONS.RENAME_SECTION, payload: { type, title } }),
    toggleSectionVisibility: (type) => dispatch({ type: ACTIONS.TOGGLE_SECTION_VISIBILITY, payload: type }),
    setTemplate: (template) => dispatch({ type: ACTIONS.SET_TEMPLATE, payload: template }),
    setTemplateCategory: (category) => dispatch({ type: ACTIONS.SET_TEMPLATE_CATEGORY, payload: category }),
    updateCustomization: (customization) => dispatch({ type: ACTIONS.UPDATE_CUSTOMIZATION, payload: customization }),
    reorderSections: (sections) => dispatch({ type: ACTIONS.REORDER_SECTIONS, payload: sections }),
    toggleDarkMode: () => dispatch({ type: ACTIONS.TOGGLE_DARK_MODE }),
    resetResume: () => dispatch({ type: ACTIONS.RESET_RESUME }),
    loadResume: (data) => dispatch({ type: ACTIONS.LOAD_RESUME, payload: data })
  };

  return (
    <ResumeContext.Provider value={{
      ...state,
      sections: buildUnifiedSections(state.resumeData, state.customization),
      ...actions
    }}>
      {children}
    </ResumeContext.Provider>
  );
}

// Custom hook to use the resume context
export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
