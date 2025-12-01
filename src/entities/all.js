import { base44 } from '@/api/base44Client';

const getEntity = (name) => {
  const entity = base44?.entities?.[name];
  if (!entity) {
    console.warn(`[entities/all] Entity "${name}" is not defined in Base44 SDK.`);
  }
  return entity;
};

const createNoopEntity = (name) => ({
  list: () => {
    throw new Error(`Entity "${name}" is not available from Base44 SDK.`);
  },
});

const safeEntity = (name) => getEntity(name) ?? createNoopEntity(name);

export const User = base44?.auth ?? {
  me: () => Promise.reject(new Error('Base44 auth is not initialized')),
};

export const Update = safeEntity('Update');
export const CurrentOffering = safeEntity('CurrentOffering');


