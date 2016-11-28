package com.reach_u.vacation.repository;

import com.reach_u.vacation.domain.User;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by tanel
 */
public class UserSpecifications {

    public static Specification<User> byQuery(String firstName, String lastName, String login, String manager){

        return new Specification<User>() {
            @Override
            public Predicate toPredicate(Root<User> root, CriteriaQuery<?> criteriaQuery, CriteriaBuilder criteriaBuilder) {
                List<Predicate> expressions = new ArrayList<>();

                if (firstName != null) {
                    expressions.add(criteriaBuilder.equal(root.get("firstName"), firstName));
                }
                if (lastName != null) {
                    expressions.add(criteriaBuilder.equal(root.get("lastName"), lastName));
                }
                if (login != null) {
                    expressions.add(criteriaBuilder.equal(root.get("login"), login));
                }
                if (manager != null) {
                    expressions.add(criteriaBuilder.equal(root.get("manager").get("login"), manager));
                }

                return criteriaBuilder.and(expressions.toArray(new Predicate[0]));
            }
        };
    }
}
