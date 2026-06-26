import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { DEFAULT_TEMPLATE_CATEGORY } from '../data/templateCategories';
import { buildUnifiedSections, normalizeCustomSection } from '../utils/resumeSections';
import { normalizeResumeData } from '../utils/resumeData';
import { useAuth } from './AuthContext';
import { fetchSavedResume, saveResume } from '../utils/resumeApi';

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
    links: [],
    title: '',
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

const payloadHash = (payload) => JSON.stringify(payload);

function parseResumeCache(rawValue) {
  if (!rawValue) return null;
  const parsed = JSON.parse(rawValue);
  if (parsed?.cacheVersion === 1 && parsed.data) {
    return {
      data: parsed.data,
      revision: Number.isInteger(parsed.revision) ? parsed.revision : 0,
      updatedAt: parsed.updatedAt || null,
      syncedHash: typeof parsed.syncedHash === 'string' ? parsed.syncedHash : ''
    };
  }
  return {
    data: parsed,
    revision: 0,
    updatedAt: null,
    syncedHash: ''
  };
}

function writeResumeCache(storageKey, data, revision, updatedAt, syncedHash) {
  localStorage.setItem(storageKey, JSON.stringify({
    cacheVersion: 1,
    data,
    revision,
    updatedAt,
    syncedHash
  }));
}

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
  MOVE_CERTIFICATION: 'MOVE_CERTIFICATION',
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
  SET_DARK_MODE: 'SET_DARK_MODE',
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

    case ACTIONS.MOVE_CERTIFICATION: {
      const certifications = [...state.resumeData.certifications];
      const { index, direction } = action.payload;
      const target = index + direction;
      if (index < 0 || target < 0 || index >= certifications.length || target >= certifications.length) return state;
      [certifications[index], certifications[target]] = [certifications[target], certifications[index]];
      return {
        ...state,
        resumeData: { ...state.resumeData, certifications }
      };
    }

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

    case ACTIONS.SET_DARK_MODE:
      return {
        ...state,
        isDarkMode: Boolean(action.payload)
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

    case ACTIONS.LOAD_RESUME: {
      const {
        resumeData,
        customization,
        isDarkMode: _deviceThemePreference,
        ...restPayload
      } = action.payload || {};

      return {
        ...state,
        ...restPayload,
        resumeData: normalizeResumeData({
          ...initialResumeData,
          ...(resumeData || {}),
          customSections: (resumeData?.customSections || []).map(normalizeCustomSection)
        }),
        customization: {
          ...initialState.customization,
          ...(customization || {}),
          sectionTitles: customization?.sectionTitles || {}
        }
      };
    }

    default:
      return state;
  }
}

// Create context
const ResumeContext = createContext();

// Context provider component
export function ResumeProvider({ children }) {
  const [state, dispatch] = useReducer(resumeReducer, initialState);
  const { user, isLoading: isAuthLoading } = useAuth();
  const [cloudStatus, setCloudStatus] = useState('loading');
  const [cloudError, setCloudError] = useState('');
  const [cloudUpdatedAt, setCloudUpdatedAt] = useState(null);
  const [cloudConflict, setCloudConflict] = useState(null);
  const [syncEpoch, setSyncEpoch] = useState(0);
  const hydratedUserRef = useRef(null);
  const lastSavedHashRef = useRef('');
  const revisionRef = useRef(0);

  const cloudPayload = useMemo(() => ({
    resumeData: state.resumeData,
    selectedTemplate: state.selectedTemplate,
    templateCategory: state.templateCategory,
    customization: state.customization
  }), [state.resumeData, state.selectedTemplate, state.templateCategory, state.customization]);

  const currentPayloadHash = useMemo(() => payloadHash(cloudPayload), [cloudPayload]);
  const currentPayloadRef = useRef(cloudPayload);
  currentPayloadRef.current = cloudPayload;

  // Dark mode is device-specific and remains local.
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true' || savedDarkMode === 'false') {
      dispatch({ type: ACTIONS.SET_DARK_MODE, payload: savedDarkMode === 'true' });
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;

    let cancelled = false;
    const hydrate = async () => {
      const storageKey = user ? `savedResume:${user.id}` : 'savedResume:guest';
      setCloudError('');

      if (!user) {
        let localResume = null;
        try {
          localResume = parseResumeCache(localStorage.getItem(storageKey));
        } catch (error) {
          console.error('Failed to read local resume', error);
          localStorage.removeItem(storageKey);
        }
        if (localResume?.data) {
          try {
            dispatch({ type: ACTIONS.LOAD_RESUME, payload: localResume.data });
          } catch (error) {
            console.error('Failed to read local resume', error);
            localStorage.removeItem(storageKey);
          }
        }
        hydratedUserRef.current = 'guest';
        setCloudStatus('local');
        return;
      }

      // Restore the account-scoped cache immediately so the editor does not
      // wait for the network. The cloud copy remains authoritative and will
      // refresh this state and cache as soon as it arrives.
      let cachedResume = null;
      try {
        cachedResume = parseResumeCache(localStorage.getItem(storageKey));
      } catch (error) {
        console.error('Failed to read cached resume', error);
        localStorage.removeItem(storageKey);
      }
      const cachedHash = cachedResume?.data ? payloadHash(cachedResume.data) : '';
      if (cachedResume?.data) {
        try {
          dispatch({ type: ACTIONS.LOAD_RESUME, payload: cachedResume.data });
          revisionRef.current = cachedResume.revision;
          lastSavedHashRef.current = cachedResume.syncedHash;
        } catch (error) {
          console.error('Failed to read cached resume', error);
          localStorage.removeItem(storageKey);
        }
      } else {
        dispatch({ type: ACTIONS.LOAD_RESUME, payload: initialState });
      }

      setCloudStatus('loading');
      try {
        const result = await fetchSavedResume();
        if (cancelled) return;

        const liveHash = payloadHash(currentPayloadRef.current);
        const localWasEdited = Boolean(cachedHash && liveHash !== cachedHash);
        const cachedWasDirty = Boolean(
          cachedResume?.data &&
          cachedResume.syncedHash &&
          cachedHash !== cachedResume.syncedHash
        );
        const localIsDirty = localWasEdited || cachedWasDirty;
        const cloudHash = result.exists ? payloadHash(result.data) : '';

        if (
          result.exists &&
          localIsDirty &&
          cachedResume?.revision < result.revision
        ) {
          revisionRef.current = result.revision;
          lastSavedHashRef.current = cloudHash;
          setCloudConflict({
            data: result.data,
            revision: result.revision,
            updatedAt: result.updatedAt
          });
          setCloudUpdatedAt(result.updatedAt);
          setCloudStatus('conflict');
        } else if (result.exists && !localIsDirty) {
          dispatch({ type: ACTIONS.LOAD_RESUME, payload: result.data });
          revisionRef.current = result.revision;
          lastSavedHashRef.current = cloudHash;
          writeResumeCache(
            storageKey,
            result.data,
            result.revision,
            result.updatedAt,
            cloudHash
          );
          setCloudUpdatedAt(result.updatedAt);
          setCloudStatus('saved');
        } else if (cachedResume?.data || localWasEdited) {
          revisionRef.current = result.revision || 0;
          lastSavedHashRef.current = result.exists ? cloudHash : '';
          setCloudUpdatedAt(result.updatedAt || cachedResume?.updatedAt || null);
          setCloudStatus('idle');
        } else {
          dispatch({ type: ACTIONS.LOAD_RESUME, payload: initialState });
          const emptyPayload = {
            resumeData: initialState.resumeData,
            selectedTemplate: initialState.selectedTemplate,
            templateCategory: initialState.templateCategory,
            customization: initialState.customization
          };
          revisionRef.current = 0;
          lastSavedHashRef.current = payloadHash(emptyPayload);
          writeResumeCache(storageKey, emptyPayload, 0, null, lastSavedHashRef.current);
          setCloudStatus('idle');
        }
        hydratedUserRef.current = user.id;
        setSyncEpoch((value) => value + 1);
      } catch (error) {
        if (cancelled) return;
        hydratedUserRef.current = user.id;
        setCloudError(error.message);
        setCloudStatus('error');
        setSyncEpoch((value) => value + 1);
      }
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [user, isAuthLoading]);

  useEffect(() => {
    localStorage.setItem('darkMode', state.isDarkMode);
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

  }, [state.isDarkMode]);

  useEffect(() => {
    if (isAuthLoading || hydratedUserRef.current === null) return undefined;

    const storageKey = user ? `savedResume:${user.id}` : 'savedResume:guest';
    writeResumeCache(
      storageKey,
      cloudPayload,
      revisionRef.current,
      cloudUpdatedAt,
      lastSavedHashRef.current
    );

    if (
      !user ||
      hydratedUserRef.current !== user.id ||
      cloudConflict ||
      currentPayloadHash === lastSavedHashRef.current
    ) {
      return undefined;
    }

    setCloudStatus('saving');
    setCloudError('');
    const timer = setTimeout(async () => {
      try {
        const result = await saveResume(cloudPayload, revisionRef.current);
        revisionRef.current = result.revision;
        lastSavedHashRef.current = currentPayloadHash;
        setCloudUpdatedAt(result.updatedAt);
        setCloudStatus('saved');
      } catch (error) {
        if (error.status === 409 && error.data?.current) {
          const current = error.data.current;
          revisionRef.current = current.revision;
          setCloudConflict(current);
          setCloudError('A newer resume exists in the cloud. Choose which version to keep.');
          setCloudStatus('conflict');
        } else {
          setCloudError(error.message);
          setCloudStatus('error');
        }
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [cloudPayload, currentPayloadHash, user, isAuthLoading, cloudConflict, cloudUpdatedAt, syncEpoch]);

  const saveResumeNow = useCallback(async (payload) => {
    const nextPayload = {
      resumeData: payload.resumeData || initialResumeData,
      selectedTemplate: payload.selectedTemplate || state.selectedTemplate,
      templateCategory: payload.templateCategory || state.templateCategory,
      customization: payload.customization || state.customization
    };
    dispatch({ type: ACTIONS.LOAD_RESUME, payload: nextPayload });

    if (!user) return null;
    setCloudStatus('saving');
    setCloudError('');
    try {
      const result = await saveResume(nextPayload, revisionRef.current);
      revisionRef.current = result.revision;
      lastSavedHashRef.current = payloadHash(nextPayload);
      setCloudUpdatedAt(result.updatedAt);
      setCloudStatus('saved');
      return result;
    } catch (error) {
      if (error.status === 409 && error.data?.current) {
        revisionRef.current = error.data.current.revision;
        setCloudConflict(error.data.current);
        setCloudError('A newer resume exists in the cloud. Choose which version to keep.');
        setCloudStatus('conflict');
      } else {
        setCloudError(error.message);
        setCloudStatus('error');
      }
      throw error;
    }
  }, [state.selectedTemplate, state.templateCategory, state.customization, user]);

  const useCloudVersion = useCallback(() => {
    if (!cloudConflict?.data || !user) return;
    dispatch({ type: ACTIONS.LOAD_RESUME, payload: cloudConflict.data });
    revisionRef.current = cloudConflict.revision;
    lastSavedHashRef.current = payloadHash(cloudConflict.data);
    setCloudUpdatedAt(cloudConflict.updatedAt);
    writeResumeCache(
      `savedResume:${user.id}`,
      cloudConflict.data,
      cloudConflict.revision,
      cloudConflict.updatedAt,
      lastSavedHashRef.current
    );
    setCloudConflict(null);
    setCloudError('');
    setCloudStatus('saved');
  }, [cloudConflict, user]);

  const keepLocalVersion = useCallback(async () => {
    if (!cloudConflict) return;
    setCloudStatus('saving');
    setCloudError('');
    try {
      const localPayload = currentPayloadRef.current;
      const result = await saveResume(localPayload, cloudConflict.revision);
      revisionRef.current = result.revision;
      lastSavedHashRef.current = payloadHash(localPayload);
      setCloudUpdatedAt(result.updatedAt);
      setCloudConflict(null);
      setCloudStatus('saved');
    } catch (error) {
      if (error.status === 409 && error.data?.current) {
        revisionRef.current = error.data.current.revision;
        setCloudConflict(error.data.current);
      }
      setCloudError(error.message);
      setCloudStatus(error.status === 409 ? 'conflict' : 'error');
    }
  }, [cloudConflict]);

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
    moveCertification: (index, direction) => dispatch({ type: ACTIONS.MOVE_CERTIFICATION, payload: { index, direction } }),
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
      cloudStatus,
      cloudError,
      cloudUpdatedAt,
      cloudConflict,
      saveResumeNow,
      useCloudVersion,
      keepLocalVersion,
      sections: buildUnifiedSections(state.resumeData, state.customization),
      ...actions
    }}>
      {children}
    </ResumeContext.Provider>
  );
}

// Custom hook to use the resume context
// eslint-disable-next-line react-refresh/only-export-components
export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
