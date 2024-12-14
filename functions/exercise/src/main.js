import { Client, Databases, ID, Query } from 'node-appwrite';
import fs from 'fs';
import path from 'path';

export default async function({ req, res, log, error }) {
    const client = new Client()
        .setEndpoint('https://store.hjm.bid/v1')
        .setProject('674818e10034704a2276')
        .setKey('30bede4d09f3efbf3fa0b7c2c18ec142168584f3994e3ce3626f4a2da409d58d21ee1f85a304826dc863b9e9bdd294a48d0962926f5d032f62135d79a64e2cae6b05d43b50f3b4c47db2de62a6405338c19848954295903c05ac650017ccd2f077c0bb94627309c4d23b7cb6c33af1cb682c441a691ce1aea3c4eac4081fa52e');

    const databases = new Databases(client);
    const DATABASE_ID = '674e5e7a0008e19d0ef0';
    const FILES_COLLECTION_ID = '6757aef2001ea2c6930a';
    const UPLOAD_DIR = 'D://data_upload'; // Local upload directory

    // Ensure upload directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    try {
        if (req.method === 'POST' && req.path === '/store-file') {
            const { name, type, userId, fileData, relativePath = '' } = JSON.parse(req.body);
            
            if (!fileData) {
                return res.json({
                    success: false,
                    message: 'File data is required'
                }, 400);
            }

            // Generate unique filename
            const uniqueFileName = `${Date.now()}-${name}`;
            
            // Create full directory path if it includes subdirectories
            const fullDirPath = UPLOAD_DIR;
            if (!fs.existsSync(fullDirPath)) {
                fs.mkdirSync(fullDirPath, { recursive: true });
            }

            // Full path for local file storage
            const localFilePath = path.join(UPLOAD_DIR, uniqueFileName);
            // Trong main.js, thêm xử lý prefix base64
            const base64Data = fileData.includes('base64,') 
            ? fileData.split('base64,')[1] 
            : fileData;

            const buffer = Buffer.from(base64Data, 'base64');
            fs.writeFileSync(localFilePath, buffer);

            // Store record in database
            const fileRecord = await databases.createDocument(
                DATABASE_ID,
                FILES_COLLECTION_ID,
                ID.unique(),
                {
                    name: name || 'Untitled',
                    path: relativePath ? path.join(relativePath, uniqueFileName) : uniqueFileName,
                    type: type || 'unknown',
                    uploadedBy: userId || 'system',
                    uploadedAt: new Date().toISOString(),
                    status: 'active',
                    localPath: localFilePath, // Store the local file path
                   
                }
            );

            return res.json({
                success: true,
                file: {
                    id: fileRecord.$id,
                    name: fileRecord.name,
                    path: fileRecord.path,
                    localPath: fileRecord.localPath,
                    type: fileRecord.type,
                    uploadedAt: fileRecord.uploadedAt
                }
            });
        }
        // Add this to main.js


        // Get file
        if (req.method === 'GET' && req.path === '/get-file') {
            const { fileId } = req.query;
            
            if (!fileId) {
                return res.json({
                    success: false,
                    message: 'File ID is required'
                }, 400);
            }

            try {
                const fileRecord = await databases.getDocument(
                    DATABASE_ID,
                    FILES_COLLECTION_ID,
                    fileId
                );

                return res.json({
                    success: true,
                    file: {
                        id: fileRecord.$id,
                        name: fileRecord.name,
                        path: fileRecord.path,
                        type: fileRecord.type,
                        content: fileRecord.content,
                        uploadedAt: fileRecord.uploadedAt
                    }
                });
            } catch (error) {
                log(error);
                return res.json({
                    success: false,
                    message: 'Failed to get file information'
                }, 500);
            }
        }

        // List files
        if (req.method === 'GET' && req.path === '/list-files') {
            const files = await databases.listDocuments(
                DATABASE_ID,
                FILES_COLLECTION_ID,
                [
                    Query.equal('status', 'active'),
                    Query.orderDesc('$createdAt')
                ]
            );

            return res.json({
                success: true,
                files: files.documents.map(file => ({
                    id: file.$id,
                    name: file.name,
                    path: file.path,
                    type: file.type,
                    uploadedAt: file.uploadedAt
                }))
            });
        }
                // Delete file
                if (req.method === 'DELETE' && req.path === '/delete-file') {
                    const { fileId } = req.body;
                    
                    if (!fileId) {
                        return res.json({
                            success: false,
                            message: 'File ID is required'
                        }, 400);
                    }

                    try {
                        // Get file record from database
                        const fileRecord = await databases.getDocument(
                            DATABASE_ID,
                            FILES_COLLECTION_ID,
                            fileId
                        );

                        // Delete local file if it exists
                        if (fileRecord.localPath && fs.existsSync(fileRecord.localPath)) {
                            fs.unlinkSync(fileRecord.localPath);
                        }

                        // Update database record
                        await databases.updateDocument(
                            DATABASE_ID,
                            FILES_COLLECTION_ID,
                            fileId,
                            { status: 'inactive' }
                        );

                        return res.json({
                            success: true,
                            message: 'File deleted successfully'
                        });
                    } catch (error) {
                        log(error);
                        return res.json({
                            success: false,
                            message: 'Failed to delete file'
                        }, 500);
                    }
                }

                return res.json({
                    success: false,
                    message: 'Invalid endpoint'
                }, 404);

            } catch (error) {
                log(error);
                return res.json({
                    success: false,
                    message: 'Internal server error'
                }, 500);
            }
        }