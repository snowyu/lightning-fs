/**
 * Standard libc error codes. Add more to this enum and ErrorStrings as they are
 * needed.
 * @url http://www.gnu.org/software/libc/manual/html_node/Error-Codes.html
 */
export const ErrorCode = {
  EPERM     : 1,
  ENOENT    : 2,
  EIO       : 5,
  EBADF     : 9,
  EACCES    : 13,
  EBUSY     : 16,
  EEXIST    : 17,
  ENOTDIR   : 20,
  EISDIR    : 21,
  EINVAL    : 22,
  EFBIG     : 27,
  ENOSPC    : 28,
  EROFS     : 30,
  ENOTEMPTY : 39,
  ENOTSUP   : 95,
}
/* tslint:disable:variable-name */
/**
 * Strings associated with each error code.
 * @hidden
 */
export const ErrorStrings = {};
ErrorStrings[ErrorCode.EPERM] = 'Operation not permitted.';
ErrorStrings[ErrorCode.ENOENT] = 'No such file or directory.';
ErrorStrings[ErrorCode.EIO] = 'Input/output error.';
ErrorStrings[ErrorCode.EBADF] = 'Bad file descriptor.';
ErrorStrings[ErrorCode.EACCES] = 'Permission denied.';
ErrorStrings[ErrorCode.EBUSY] = 'Resource busy or locked.';
ErrorStrings[ErrorCode.EEXIST] = 'File exists.';
ErrorStrings[ErrorCode.ENOTDIR] = 'File is not a directory.';
ErrorStrings[ErrorCode.EISDIR] = 'File is a directory.';
ErrorStrings[ErrorCode.EINVAL] = 'Invalid argument.';
ErrorStrings[ErrorCode.EFBIG] = 'File is too big.';
ErrorStrings[ErrorCode.ENOSPC] = 'No space left on disk.';
ErrorStrings[ErrorCode.EROFS] = 'Cannot modify a read-only file system.';
ErrorStrings[ErrorCode.ENOTEMPTY] = 'Directory is not empty.';
ErrorStrings[ErrorCode.ENOTSUP] = 'Operation is not supported.';
/* tslint:enable:variable-name */

export function apiError(e, type, path, message = ErrorStrings[type])
{
  e.errno = ErrorCode[type];
  e.code = type;
  e.path = path;
  e.message = `Error: ${type}: ${message}${path ? `, '${path}'` : ''}`;
  return e;
}

