import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial resume data structure
const initialResumeData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    summary: '',
    photo: null
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: []
};

// Initial state
const initialState = {
  resumeData: initialResumeData,
  selectedTemplate: 'modern',
  templateCategory: 'without-photo',
  customization: {
    fontFamily: 'Inter',
    colorTheme: 'blue',
    sectionOrder: ['personalInfo', 'summary', 'experience', 'education', 'skills', 'projects']
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
        ...action.payload
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

  // Load dark mode preference from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      dispatch({ type: ACTIONS.TOGGLE_DARK_MODE });
    }
  }, []);

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', state.isDarkMode);
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkMode]);

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
    setTemplate: (template) => dispatch({ type: ACTIONS.SET_TEMPLATE, payload: template }),
    setTemplateCategory: (category) => dispatch({ type: ACTIONS.SET_TEMPLATE_CATEGORY, payload: category }),
    updateCustomization: (customization) => dispatch({ type: ACTIONS.UPDATE_CUSTOMIZATION, payload: customization }),
    reorderSections: (sections) => dispatch({ type: ACTIONS.REORDER_SECTIONS, payload: sections }),
    toggleDarkMode: () => dispatch({ type: ACTIONS.TOGGLE_DARK_MODE }),
    resetResume: () => dispatch({ type: ACTIONS.RESET_RESUME }),
    loadResume: (data) => dispatch({ type: ACTIONS.LOAD_RESUME, payload: data })
  };

  return (
    <ResumeContext.Provider value={{ ...state, ...actions }}>
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

export { ACTIONS };