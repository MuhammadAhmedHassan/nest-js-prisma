import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: { userId },
    });
  }

  getBookmarkById(userId: number, bookmarkId: number) {
    return this.getBookmarkByIdAndUserId(userId, bookmarkId);
  }

  createBookmark(userId: number, dto: CreateBookmarkDto) {
    return this.prisma.bookmark.create({ data: { ...dto, userId } });
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    await this.getBookmarkByIdAndUserId(userId, bookmarkId);
    const updatedBookmark = await this.prisma.bookmark.update({
      where: { id: bookmarkId },
      data: { ...dto },
    });
    return updatedBookmark;
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    await this.getBookmarkByIdAndUserId(userId, bookmarkId);
    await this.prisma.bookmark.delete({
      where: { id: bookmarkId },
    });
    return;
  }

  private async getBookmarkByIdAndUserId(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId },
    });
    if (!bookmark) {
      throw new BadRequestException('Bookmark not found');
    }
    return bookmark;
  }
}
