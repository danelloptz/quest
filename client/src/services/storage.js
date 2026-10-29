const TOKEN_KEY = 'volleyball_participant_token';
const ATTEMPT_KEY = 'volleyball_attempt_id';

export function getParticipantToken() {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = 'usr_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

export function getAttemptId() {
  return localStorage.getItem(ATTEMPT_KEY);
}

export function setAttemptId(id) {
  localStorage.setItem(ATTEMPT_KEY, id);
}

export function clearAttempt() {
  localStorage.removeItem(ATTEMPT_KEY);
}