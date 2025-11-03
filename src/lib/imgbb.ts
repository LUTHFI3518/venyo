// ImgBB API integration for free PDF uploads
// ImgBB is completely free - no credit card required!

export interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    size: number;
    time: string;
    expiration: string;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

/**
 * Upload a file to ImgBB
 * @param file - File to upload (PDF, image, etc.)
 * @param apiKey - ImgBB API key (get from https://api.imgbb.com/)
 * @returns Promise with ImgBB response containing the file URL
 */
export async function uploadToImgBB(
  file: File,
  apiKey: string
): Promise<ImgBBResponse> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${apiKey}`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ImgBB upload failed: ${errorText}`);
  }

  const data: ImgBBResponse = await response.json();

  if (!data.success) {
    throw new Error(`ImgBB upload failed: ${JSON.stringify(data)}`);
  }

  return data;
}

