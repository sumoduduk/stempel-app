import { open } from '@tauri-apps/plugin-dialog';

export const getImages = async () => {
    return await open({
        multiple: false,
        title: 'Open Single Image',
        filters: [
            {
                name: 'Image',
                extensions: ['jpeg', 'jpg', 'webp', 'png'],
            },
        ],
    });
};

export const getWatermarkImage = async () => {
    return await open({
        multiple: false,
        title: 'Open Image',
        filters: [
            {
                name: 'Image',
                extensions: ['jpeg', 'jpg', 'webp', 'png'],
            },
        ],
    });
};
