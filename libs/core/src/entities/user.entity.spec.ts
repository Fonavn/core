import { User } from './user.entity';
import * as moment from 'moment';

describe('User', () => {
  describe('Password confirmation', () => {
    it('should set salt', () => {
      const tempUser = new User();
      tempUser.setPassword('12345678');

      expect(tempUser.salt).toBeDefined();
    });

    it('should set comfirmation code', () => {
      const tempUser = new User();
      tempUser.setPassword('12345678');

      expect(tempUser.confirmCode).toBeDefined();
    });

    it('should set comfirmation exprired date', () => {
      const tempUser = new User();
      tempUser.setPassword('12345678');

      expect(tempUser.expiredConfirm.getTime()).toBeLessThanOrEqual(
        moment()
          .add(10, 'days')
          .toDate()
          .getTime(),
      );
      expect(tempUser.expiredConfirm.getTime()).toBeGreaterThan(
        moment()
          .add(9, 'days')
          .toDate()
          .getTime(),
      );
    });

    it('should compare password', () => {
      const tempUser = new User();
      tempUser.setPassword('12345678');

      expect(tempUser.validatePassword('12345678')).toBe(true);
      expect(tempUser.validatePassword('123456789')).toBe(false);
    });
  });

  describe('Password reset', () => {
    it('should set comfirmation exprired date', () => {
      const tempUser = new User();
      tempUser.resetPwInit();

      expect(tempUser.resetPwCode).toBeDefined();
      expect(tempUser.expiredResetPw.getTime()).toBeLessThanOrEqual(
        moment()
          .add(120, 'minutes')
          .toDate()
          .getTime(),
      );
      expect(tempUser.expiredResetPw.getTime()).toBeGreaterThan(
        moment()
          .add(119, 'minutes')
          .toDate()
          .getTime(),
      );
    });
  });
});
