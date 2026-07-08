import { File } from 'expo-file-system';

import { deleteRecordingFile } from '@/src/lib/recordingFiles';

jest.mock('expo-file-system', () => ({
  File: jest.fn(),
}));

const mockDelete = jest.fn();
const mockedFile = File as unknown as jest.Mock;

describe('deleteRecordingFile', () => {
  beforeEach(() => {
    mockDelete.mockReset();
    mockedFile.mockClear();
    mockedFile.mockImplementation(() => ({
      delete: mockDelete,
      exists: true,
    }));
  });

  it('deletes when a uri is present', async () => {
    await deleteRecordingFile('file:///recording.m4a');

    expect(mockedFile).toHaveBeenCalledWith('file:///recording.m4a');
    expect(mockDelete).toHaveBeenCalledTimes(1);
  });

  it('does nothing when the uri is undefined', async () => {
    await deleteRecordingFile(undefined);

    expect(mockedFile).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('swallows deletion errors', async () => {
    mockDelete.mockImplementationOnce(() => {
      throw new Error('delete failed');
    });

    await expect(
      deleteRecordingFile('file:///missing-recording.m4a'),
    ).resolves.toBeUndefined();
  });
});
